import { View, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { formatPhone } from "../shared/helpers";
import { styles } from "./clients.styles";

export function ClientModal({ visible, editingClient, form, setForm, onSave, onClose, colors }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingModal}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Ex: João Silva"
              placeholderTextColor={colors.text + "66"}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
              placeholder="cliente@email.com"
              placeholderTextColor={colors.text + "66"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
            />

            <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.text + "66"}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: formatPhone(v) })}
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
      </View>
    </Modal>
  );
}
