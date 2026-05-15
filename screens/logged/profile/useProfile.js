import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getSession, updateUser, setSession } from "../../../functions/shared/secureStorage";
import { handleMessage } from "../../../components/general/ToastMessage";
import { formatCellphone } from "../../../functions/general/Masks";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Remove tudo que não é dígito */
const digitsOnly = (v) => v.replace(/\D/g, "");

/**
 * Converte "aaaa-mm-dd" (ou string de Date) → "dd/mm/aaaa".
 */
export function isoDateToBR(iso) {
  if (!iso) return "";
  // Trata o caso onde vem como "aaaa-mm-dd 00:00:00" etc
  const parts = iso.split(" ")[0].split("-");
  if (parts.length < 3) return "";
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Converte timestamp (ms) → "aaaa-mm-dd" para persistir no banco.
 */
function tsToISO(ts) {
  if (!ts) return null;
  return new Date(ts).toISOString().split("T")[0];
}

/**
 * Converte "aaaa-mm-dd" salvo no banco → timestamp (ms) para inicializar o picker.
 * Retorna null se inválido.
 */
function isoToTs(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.getTime();
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProfile() {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  // ── Modais
  const [editModal,   setEditModal]   = useState(false);
  const [passModal,   setPassModal]   = useState(false);

  // ── Formulário de dados pessoais
  const [form, setForm] = useState({
    fullName:  "",
    email:     "",
    phone:     "",
    birthDate: null, // timestamp (ms) ou null
    gender:    "",
  });

  // ── Formulário de senha
  const [passForm, setPassForm] = useState({
    current:  "",
    next:     "",
    confirm:  "",
  });

  // ── Visibilidade das senhas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    setLoading(true);
    const u = await getSession();
    setUser(u);
    setLoading(false);
  };

  // ── Abrir modal de edição ───────────────────────────────────────────────────

  const openEditModal = () => {
    if (!user) return;
    setForm({
      fullName:  user.fullName  || "",
      email:     user.email     || "",
      phone:     formatCellphone(user.phone || "", true),
      birthDate: isoToTs(user.birthDate),   // ISO salvo → timestamp para o picker
      gender:    user.gender    || "",
    });
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setForm({ fullName: "", email: "", phone: "", birthDate: null, gender: "" });
  };

  // ── Abrir modal de senha ────────────────────────────────────────────────────

  const openPassModal = () => {
    setPassForm({ current: "", next: "", confirm: "" });
    setShowCurrent(false);
    setShowNext(false);
    setShowConfirm(false);
    setPassModal(true);
  };

  const closePassModal = () => {
    setPassModal(false);
    setPassForm({ current: "", next: "", confirm: "" });
  };

  // ── Salvar dados pessoais ──────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    // Validações
    if (!form.fullName.trim()) {
      handleMessage(false, "Campo obrigatório", "Informe seu nome completo.");
      return;
    }
    if (form.email && (!form.email.includes("@") || !form.email.includes("."))) {
      handleMessage(false, "Email inválido", "Informe um email válido.");
      return;
    }

    // Verificação de senha
    const currentPass = form._password || "";
    if (!currentPass) {
      handleMessage(false, "Senha obrigatória", "Confirme sua senha para salvar as alterações.");
      return;
    }
    if (currentPass !== user.password) {
      handleMessage(false, "Senha incorreta", "A senha informada não confere.");
      return;
    }

    setSaving(true);
    try {
      const updated = {
        ...user,
        fullName:  form.fullName.trim(),
        email:     form.email.trim(),
        phone:     digitsOnly(form.phone),
        birthDate: form.birthDate ? tsToISO(form.birthDate) : user.birthDate,
        gender:    form.gender || user.gender,
      };
      await updateUser(updated);
      await setSession(updated);
      setUser(updated);
      handleMessage(true, "Sucesso", "Perfil atualizado com sucesso!");
      closeEditModal();
    } catch (e) {
      handleMessage(false, "Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  // ── Trocar senha ────────────────────────────────────────────────────────────

  const handleSavePassword = async () => {
    if (!passForm.current) {
      handleMessage(false, "Campo obrigatório", "Informe a senha atual.");
      return;
    }
    if (passForm.current !== user.password) {
      handleMessage(false, "Senha incorreta", "A senha atual não confere.");
      return;
    }
    if (!passForm.next || passForm.next.length < 8) {
      handleMessage(false, "Senha fraca", "A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (passForm.next !== passForm.confirm) {
      handleMessage(false, "Senhas diferentes", "A confirmação não coincide com a nova senha.");
      return;
    }
    if (passForm.next === passForm.current) {
      handleMessage(false, "Senha igual", "A nova senha deve ser diferente da atual.");
      return;
    }

    setSaving(true);
    try {
      const updated = { ...user, password: passForm.next };
      await updateUser(updated);
      await setSession(updated);
      setUser(updated);
      handleMessage(true, "Senha alterada", "Sua senha foi atualizada com sucesso!");
      closePassModal();
    } catch (e) {
      handleMessage(false, "Erro", "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers de form ─────────────────────────────────────────────────────────

  const updateForm = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const updateFormPhone = (v) => updateForm("phone", formatCellphone(v, true));

  /** Recebe um Date ou timestamp vindo do picker e armazena como timestamp */
  const updateFormBirthDate = (dateObj) => {
    const ts = dateObj instanceof Date ? dateObj.getTime() : Number(dateObj);
    updateForm("birthDate", isNaN(ts) ? null : ts);
  };

  const updatePassForm = (field, value) => setPassForm((p) => ({ ...p, [field]: value }));

  return {
    user, loading, saving,
    // modais
    editModal,  openEditModal,  closeEditModal,
    passModal,  openPassModal,  closePassModal,
    // form edição
    form, updateForm, updateFormPhone, updateFormBirthDate,
    handleSaveProfile,
    // form senha
    passForm, updatePassForm,
    showCurrent, setShowCurrent,
    showNext,    setShowNext,
    showConfirm, setShowConfirm,
    handleSavePassword,
  };
}