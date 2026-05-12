import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { formatCurrency } from "../shared/helpers";
import { PRODUCT_CATEGORIES } from "./useProducts";
import { Input } from "../../../components/general/Input";
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

        <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
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
            <Input
              label="Nome *"
              icon="box"
              placeholder="Ex: Camiseta Básica"
              background={colors.card}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              returnKeyType="next"
            />

            {/* Categoria */}
            <Text style={[styles.label, { color: colors.text }]}>Categoria *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {PRODUCT_CATEGORIES.map((cat) => {
                const selected = form.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setForm({ ...form, category: cat })}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? colors.mediumRed : colors.background,
                        borderColor: selected ? colors.mediumRed : colors.text + "33",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: selected ? "#fff" : colors.text },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quantidade + Valor */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Quantidade *"
                  icon="cubes"
                  placeholder="0"
                  keyboardType="numeric"
                  background={colors.card}
                  value={form.quantity}
                  onChangeText={(v) => setForm({ ...form, quantity: v.replace(/\D/g, "") })}
                  returnKeyType="next"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="Valor (R$) *"
                  icon="money-bill-wave"
                  placeholder="0,00"
                  keyboardType="numeric"
                  background={colors.card}
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: formatCurrency(v) })}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Descrição */}
            <Input
              label="Descrição"
              icon="align-left"
              placeholder="Detalhes adicionais do produto..."
              background={colors.card}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline={true}
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