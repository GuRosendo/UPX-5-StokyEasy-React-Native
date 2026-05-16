import { useState } from "react";
import { handleMessage } from "../../components/general/ToastMessage";
import { getUsers, updateUser } from "../../functions/shared/secureStorage";
import { formatDate, formatCellphone } from "../../functions/general/Masks";
import { ValidateDateOfBirth } from "../../functions/general/ValidateDateOfBirth";
import { validateCellphone } from "../../functions/general/ValidateCellphone";

// ─── Etapas ──────────────────────────────────────────────────────────────────
// STEP 1 → usuário informa celular, email e data de nascimento para verificação
// STEP 2 → usuário define nova senha

export const STEP = { VERIFY: "verify", NEW_PASS: "new_pass" };

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useForgotPassword() {
  const [step, setStep]       = useState(STEP.VERIFY);
  const [loading, setLoading] = useState(false);

  // Dados de verificação
  const [celular,      setCelular]      = useState("");
  const [email,        setEmail]        = useState("");
  const [dateSelected, setDateSelected] = useState(""); // Date | ""

  // Dados de nova senha
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [hideNew,     setHideNew]     = useState(true);
  const [hideConfirm, setHideConfirm] = useState(true);

  // Usuário encontrado na verificação
  const [matchedUser, setMatchedUser] = useState(null);

  // ── Step 1: verificar identidade ────────────────────────────────────────────

  const handleVerify = async () => {
    // Valida celular
    if (!validateCellphone(celular)) {
      handleMessage(false, "Ocorreu um erro", "Número de celular incorreto");
      return;
    }

    // Valida email
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      handleMessage(false, "Ocorreu um erro", "Email incorreto");
      return;
    }

    // Valida data
    if (!ValidateDateOfBirth(dateSelected)) {
      handleMessage(false, "Ocorreu um erro", "Data de nascimento inválida");
      return;
    }

    setLoading(true);
    try {
      const users = await getUsers();

      const birthFormatted = formatDate(dateSelected, "EUA", true);

      const found = users?.find((u) => {
        const samePhone = String(u.phone || "").replace(/\D/g, "") === celular.replace(/\D/g, "");
        const sameEmail = (u.email || "").toLowerCase().trim() === email.toLowerCase().trim();

        // Normaliza os dois lados para "YYYY-MM-DD" antes de comparar,
        // eliminando diferenças de fuso horário e de formato
        const sameBirth = (() => {
          try {
            const saved   = new Date(u.birthDate).toISOString().split("T")[0];
            const entered = new Date(birthFormatted).toISOString().split("T")[0];
            return saved === entered;
          } catch {
            return false;
          }
        })();

        return samePhone && sameEmail && sameBirth;
      });

      if (!found) {
        handleMessage(false, "Ocorreu um erro", "Nenhuma conta corresponde aos dados informados");
        return;
      }

      setMatchedUser(found);
      setStep(STEP.NEW_PASS);
    } catch (e) {
      handleMessage(false, "Ocorreu um erro", "Não foi possível verificar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: salvar nova senha ────────────────────────────────────────────────

  const handleSaveNewPassword = async () => {
    if (!newPass || newPass.length < 8) {
      handleMessage(false, "Ocorreu um erro", "Senha incorreta, a senha deve possuir 8 caracteres");
      return;
    }
    if (newPass !== confirmPass) {
      handleMessage(false, "Ocorreu um erro", "As senhas não coincidem");
      return;
    }
    if (newPass === matchedUser.password) {
      handleMessage(false, "Ocorreu um erro", "A nova senha deve ser diferente da atual");
      return;
    }

    setLoading(true);
    try {
      const updated = { ...matchedUser, password: newPass };
      await updateUser(updated);
      handleMessage(true, "Sucesso", "Sua senha foi redefinida com sucesso");
      return true;
    } catch (e) {
      handleMessage(false, "Ocorreu um erro", "Não foi possível salvar a nova senha. Tente novamente.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Resetar tudo ────────────────────────────────────────────────────────────

  const reset = () => {
    setStep(STEP.VERIFY);
    setCelular("");
    setEmail("");
    setDateSelected("");
    setNewPass("");
    setConfirmPass("");
    setMatchedUser(null);
  };

  return {
    step,
    loading,
    // Step 1
    celular, setCelular,
    email, setEmail,
    dateSelected, setDateSelected,
    handleVerify,
    // Step 2
    newPass,     setNewPass,
    confirmPass, setConfirmPass,
    hideNew,     setHideNew,
    hideConfirm, setHideConfirm,
    handleSaveNewPassword,
    // util
    reset,
  };
}