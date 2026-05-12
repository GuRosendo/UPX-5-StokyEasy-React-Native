import { View, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { formatPhone } from "../shared/helpers";
import { Input } from "../../../components/general/Input";
import { styles } from "./clients.styles";

export function ClientModal({ visible, editingClient, form, setForm, onSave, onClose, colors }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingClient ? "Editar Cliente" : "Novo Cliente"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Nome */}
          <Input
            label="Nome *"
            icon="user"
            placeholder="Ex: João Silva"
            background={colors.background}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            returnKeyType="next"
          />

          {/* Email */}
          <Input
            label="Email"
            icon="envelope"
            placeholder="cliente@email.com"
            background={colors.background}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            returnKeyType="next"
          />

          {/* Telefone */}
          <Input
            label="Telefone"
            icon="phone"
            placeholder="(00) 00000-0000"
            background={colors.background}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: formatPhone(v) })}
            returnKeyType="done"
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={[styles.modalBtn, { borderColor: colors.mediumRed }]}
              labelStyle={{ color: colors.mediumRed }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={onSave}
              style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]}
              labelStyle={{ color: "#fff" }}
            >
              {editingClient ? "Salvar" : "Cadastrar"}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}