import {
  View,
  Modal,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { formatCurrency } from "../shared/helpers";
import { styles } from "./products.styles";

export function ProductModal({ visible, editingProduct, form, setForm, onSave, onClose, colors }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Nome */}
            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.mediumRed,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Ex: Camiseta Básica"
              placeholderTextColor={colors.text + "66"}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              returnKeyType="next"
            />

            {/* Quantidade + Valor */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: colors.text }]}>Quantidade *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.mediumRed,
                      color: colors.text,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="0"
                  placeholderTextColor={colors.text + "66"}
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={(v) => setForm({ ...form, quantity: v.replace(/\D/g, "") })}
                  returnKeyType="next"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.text }]}>Valor (R$) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.mediumRed,
                      color: colors.text,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="0,00"
                  placeholderTextColor={colors.text + "66"}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: formatCurrency(v) })}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Descrição */}
            <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: colors.mediumRed,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Detalhes adicionais do produto..."
              placeholderTextColor={colors.text + "66"}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
            />

            {/* Botões */}
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
                {editingProduct ? "Salvar" : "Cadastrar"}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}