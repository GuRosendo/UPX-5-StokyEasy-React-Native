import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { formatCurrency } from "../shared/helpers";
import { styles } from "./clients.styles";

export function AddInstallmentModal({ visible, value, setValue, onSave, onClose, colors }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar Parcela</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Valor da parcela *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
            placeholder="0,00"
            placeholderTextColor={colors.text + "66"}
            keyboardType="numeric"
            value={value}
            onChangeText={(v) => setValue(formatCurrency(v))}
            returnKeyType="done"
            autoFocus
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
              Adicionar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}