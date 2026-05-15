import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useTheme } from "../../../components/ThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input } from "../../../components/general/Input";
import { formatCellphone } from "../../../functions/general/Masks";
import { useProfile } from "./useProfile";

// ─── Assets ──────────────────────────────────────────────────────────────────

const GENDER_AVATAR = {
  MASCULINO: require("../../../assets/images/man.png"),
  FEMININO:  require("../../../assets/images/woman.png"),
};

function getAvatar(gender) {
  if (!gender) return null;
  return GENDER_AVATAR[gender.toString().toUpperCase().trim()] ?? null;
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value, colors }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.iconBox, { backgroundColor: colors.mediumRed + "18" }]}>
        <FontAwesome6 name={icon} size={15} color={colors.mediumRed} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.text + "77" }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ─── GenderPicker ─────────────────────────────────────────────────────────────

function GenderPicker({ value, onChange, colors }) {
  const options = ["MASCULINO", "FEMININO"];
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>Sexo</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {options.map((opt) => {
          const selected = value?.toUpperCase() === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.genderBtn,
                {
                  borderColor:     selected ? colors.mediumRed : colors.text + "33",
                  backgroundColor: selected ? colors.mediumRed + "18" : "transparent",
                },
              ]}
              onPress={() => onChange(opt)}
              activeOpacity={0.75}
            >
              <FontAwesome6
                name={opt === "MASCULINO" ? "mars" : "venus"}
                size={14}
                color={selected ? colors.mediumRed : colors.text + "66"}
              />
              <Text style={[styles.genderBtnText, { color: selected ? colors.mediumRed : colors.text + "88" }]}>
                {opt.charAt(0) + opt.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── StrengthBar ──────────────────────────────────────────────────────────────

function StrengthBar({ password, colors }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8)           s++;
    if (password.length >= 12)          s++;
    if (/[A-Z]/.test(password))         s++;
    if (/[0-9]/.test(password))         s++;
    if (/[^A-Za-z0-9]/.test(password))  s++;
    return s;
  })();
  const levels = [
    { label: "Muito fraca", color: "#e74c3c" },
    { label: "Fraca",       color: "#e67e22" },
    { label: "Razoável",    color: "#f1c40f" },
    { label: "Boa",         color: "#2ecc71" },
    { label: "Forte",       color: "#27ae60" },
  ];
  const level = levels[Math.min(score - 1, 4)] || levels[0];
  return (
    <View style={{ marginBottom: 12, marginTop: -4 }}>
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i < score ? level.color : colors.text + "18",
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: level.color, fontWeight: "600" }}>{level.label}</Text>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();

  const {
    user, loading, saving,
    editModal,  openEditModal,  closeEditModal,
    passModal,  openPassModal,  closePassModal,
    form, updateForm, updateFormPhone, updateFormBirthDate,
    handleSaveProfile,
    passForm, updatePassForm,
    showCurrent, setShowCurrent,
    showNext,    setShowNext,
    showConfirm, setShowConfirm,
    handleSavePassword,
  } = useProfile();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split(" ")[0].split("-");
    if (parts.length < 3) return dateString;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy.padStart(4, "0")}`;
  };

  const avatarSource = user ? getAvatar(user.gender) : null;

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.mediumRed} />
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={[styles.avatarRing, { borderColor: colors.mediumRed + "33" }]}>
            <View style={[styles.avatarBackground, { backgroundColor: colors.mediumRed + "12" }]}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatar} resizeMode="contain" />
              ) : (
                <FontAwesome6 name="user" size={72} color={colors.mediumRed} style={{ opacity: 0.5 }} />
              )}
            </View>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
          <Text style={[styles.emailHero, { color: colors.text }]}>{user.email}</Text>
        </View>

        {/* ── Card informações ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text + "55" }]}>INFORMAÇÕES</Text>
          <InfoRow icon="envelope"     label="Email"      value={user.email}                              colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
          <InfoRow icon="phone"        label="Telefone"   value={formatCellphone(user.phone || "", true)} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
          <InfoRow icon="cake-candles" label="Nascimento" value={formatDate(user.birthDate)}              colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
          <InfoRow icon="venus-mars"   label="Sexo"       value={user.gender}                             colors={colors} />
        </View>

        {/* ── Card conta ── */}
        <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text + "55" }]}>CONTA</Text>

          <TouchableOpacity
            style={[styles.actionRow, { borderColor: colors.text + "12" }]}
            onPress={openEditModal}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.mediumRed + "15" }]}>
              <FontAwesome6 name="pen-to-square" size={15} color={colors.mediumRed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Editar informações</Text>
              <Text style={[styles.actionSub, { color: colors.text + "66" }]}>Nome, email, telefone, nascimento e sexo</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={12} color={colors.text} style={{ opacity: 0.3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderColor: colors.text + "12", borderTopWidth: 0 }]}
            onPress={openPassModal}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.mediumRed + "15" }]}>
              <FontAwesome6 name="key" size={15} color={colors.mediumRed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Alterar senha</Text>
              <Text style={[styles.actionSub, { color: colors.text + "66" }]}>Requer a senha atual para confirmar</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={12} color={colors.text} style={{ opacity: 0.3 }} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Editar informações
      ════════════════════════════════════════════════════════════════════ */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={closeEditModal}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeEditModal} />

          <View style={[styles.sheet, { backgroundColor: colors.background }]}>

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Editar perfil</Text>
              <TouchableOpacity onPress={closeEditModal}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Input
                label="Nome completo *"
                icon="user"
                placeholder="Ex: João Silva"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                value={form.fullName}
                onChangeText={(v) => updateForm("fullName", v)}
                returnKeyType="next"
              />

              <Input
                label="Email"
                icon="envelope"
                placeholder="voce@email.com"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => updateForm("email", v)}
                returnKeyType="next"
              />

              <Input
                label="Telefone"
                icon="phone"
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={updateFormPhone}
                returnKeyType="next"
              />

              <Input
                label="Data de nascimento"
                icon="cake-candles"
                placeholder="Selecione a data"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                isDate={true}
                editable={false}
                useTodayAsMin={false}
                useTodayAsDefaultValue={!form.birthDate}
                initialDate={
                  form.birthDate
                    ? new Date(form.birthDate).toISOString().split("T")[0]
                    : undefined
                }
                value={
                  form.birthDate
                    ? new Date(form.birthDate).toISOString().split("T")[0].split("-").reverse().join("/")
                    : ""
                }
                setDateSelected={updateFormBirthDate}
              />

              <GenderPicker
                value={form.gender}
                onChange={(v) => updateForm("gender", v)}
                colors={colors}
              />

              {/* ── Bloco de confirmação de senha ── */}
              <View style={[styles.confirmBox, { borderColor: colors.mediumRed + "33", backgroundColor: colors.mediumRed + "08" }]}>
                <View style={styles.confirmBoxHeader}>
                  <FontAwesome6 name="shield-halved" size={13} color={colors.mediumRed} />
                  <Text style={[styles.confirmBoxTitle, { color: colors.mediumRed }]}>
                    Confirme sua senha para salvar
                  </Text>
                </View>
                <Input
                  label="Senha atual *"
                  icon="lock"
                  placeholder="Informe sua senha"
                  placeholderTextColor={colors.text + "66"}
                  background={colors.card}
                  value={form._password || ""}
                  onChangeText={(v) => updateForm("_password", v)}
                  secureTextEntry={!showCurrent}
                  isPassword={true}
                  hidePassword={!showCurrent}
                  setHidePassword={(hide) => setShowCurrent(!hide)}
                  returnKeyType="done"
                />
              </View>

              <View style={styles.sheetButtons}>
                <Button
                  mode="outlined"
                  onPress={closeEditModal}
                  style={[styles.sheetBtn, { borderColor: colors.mediumRed }]}
                  labelStyle={{ color: colors.mediumRed }}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={saving}
                  disabled={saving}
                  style={[styles.sheetBtn, { backgroundColor: colors.mediumRed }]}
                  labelStyle={{ color: "#fff" }}
                >
                  Salvar
                </Button>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL — Alterar senha
      ════════════════════════════════════════════════════════════════════ */}
      <Modal visible={passModal} transparent animationType="slide" onRequestClose={closePassModal}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closePassModal} />

          <View style={[styles.sheet, { backgroundColor: colors.background }]}>

            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Alterar senha</Text>
              <TouchableOpacity onPress={closePassModal}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Aviso */}
              <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.text + "15" }]}>
                <FontAwesome6 name="circle-info" size={13} color={colors.mediumRed} style={{ marginTop: 1 }} />
                <Text style={[styles.infoBoxText, { color: colors.text }]}>
                  Informe sua senha atual para confirmar. A nova senha deve ter no mínimo 8 caracteres.
                </Text>
              </View>

              <Input
                label="Senha atual *"
                icon="lock"
                placeholder="Informe sua senha atual"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                value={passForm.current}
                onChangeText={(v) => updatePassForm("current", v)}
                secureTextEntry={!showCurrent}
                isPassword={true}
                hidePassword={!showCurrent}
                setHidePassword={(hide) => setShowCurrent(!hide)}
                returnKeyType="next"
              />

              <Input
                label="Nova senha *"
                icon="lock"
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                value={passForm.next}
                onChangeText={(v) => updatePassForm("next", v)}
                secureTextEntry={!showNext}
                isPassword={true}
                hidePassword={!showNext}
                setHidePassword={(hide) => setShowNext(!hide)}
                returnKeyType="next"
              />

              {passForm.next.length > 0 && (
                <StrengthBar password={passForm.next} colors={colors} />
              )}

              <Input
                label="Confirmar nova senha *"
                icon="lock"
                placeholder="Repita a nova senha"
                placeholderTextColor={colors.text + "66"}
                background={colors.card}
                value={passForm.confirm}
                onChangeText={(v) => updatePassForm("confirm", v)}
                secureTextEntry={!showConfirm}
                isPassword={true}
                hidePassword={!showConfirm}
                setHidePassword={(hide) => setShowConfirm(!hide)}
                returnKeyType="done"
              />

              {/* Indicador de match */}
              {passForm.confirm.length > 0 && (
                <View style={[styles.matchRow, { marginBottom: 12, marginTop: -4 }]}>
                  <FontAwesome6
                    name={passForm.next === passForm.confirm ? "circle-check" : "circle-xmark"}
                    size={13}
                    color={passForm.next === passForm.confirm ? "#27ae60" : "#c0392b"}
                  />
                  <Text style={{
                    fontSize: 12, marginLeft: 6,
                    color: passForm.next === passForm.confirm ? "#27ae60" : "#c0392b",
                  }}>
                    {passForm.next === passForm.confirm ? "Senhas coincidem" : "Senhas não coincidem"}
                  </Text>
                </View>
              )}

              <View style={styles.sheetButtons}>
                <Button
                  mode="outlined"
                  onPress={closePassModal}
                  style={[styles.sheetBtn, { borderColor: colors.mediumRed }]}
                  labelStyle={{ color: colors.mediumRed }}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSavePassword}
                  loading={saving}
                  disabled={saving}
                  style={[styles.sheetBtn, { backgroundColor: colors.mediumRed }]}
                  labelStyle={{ color: "#fff" }}
                >
                  Alterar
                </Button>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { alignItems: "center", padding: 20, paddingBottom: 60 },

  // ── Hero
  hero:             { alignItems: "center", marginBottom: 28 },
  avatarRing:       { width: 160, height: 160, borderRadius: 80, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarBackground: { width: 144, height: 144, borderRadius: 72, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatar:           { width: 130, height: 130 },
  name:             { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  emailHero:        { fontSize: 13, opacity: 0.5, textAlign: "center" },

  // ── Cards
  card: {
    width: "100%", borderRadius: 20, padding: 20,
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
    marginBottom: 14,
  },
  actionsCard: {
    width: "100%", borderRadius: 20, padding: 20,
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  cardTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 16 },

  // ── InfoRow
  infoRow:   { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  iconBox:   { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  infoText:  { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  infoValue: { fontSize: 15, fontWeight: "500" },
  divider:   { height: 1, marginLeft: 52 },

  // ── ActionRow
  actionRow:   { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14, borderTopWidth: 1 },
  actionIcon:  { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  actionSub:   { fontSize: 12 },

  // ── Modal / Sheet
  overlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
    maxHeight: "92%", elevation: 10,
  },
  sheetHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle:   { fontSize: 20, fontWeight: "700" },
  sheetButtons: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  sheetBtn:     { flex: 1, borderRadius: 12 },

  // ── Gênero
  fieldLabel:    { fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 10, opacity: 0.8 },
  genderBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderWidth: 1.5, borderRadius: 12 },
  genderBtnText: { fontSize: 14, fontWeight: "600" },

  // ── Bloco confirmação senha
  confirmBox:       { borderWidth: 1.5, borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 4 },
  confirmBoxHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  confirmBoxTitle:  { fontSize: 13, fontWeight: "700" },

  // ── Info box (aviso)
  infoBox:     { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16, alignItems: "flex-start" },
  infoBoxText: { flex: 1, fontSize: 12, lineHeight: 18, opacity: 0.8 },

  // ── Match row
  matchRow: { flexDirection: "row", alignItems: "center" },
});