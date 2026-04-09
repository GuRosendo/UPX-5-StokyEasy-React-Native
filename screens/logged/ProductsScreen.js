import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../components/ThemeContext";

// Formata valor para moeda BRL enquanto o usuário digita
const formatCurrency = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  const number = (parseInt(numeric, 10) / 100).toFixed(2);
  return number.replace(".", ",");
};

const parseCurrency = (value) => {
  return parseFloat(value.replace(",", ".")) || 0;
};

const EMPTY_FORM = {
  name: "",
  quantity: "",
  price: "",
  description: "",
};

export default function ProductsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const stored = await AsyncStorage.getItem("products");
    const list = stored ? JSON.parse(stored) : [];
    const userProducts = list.filter((p) => p.userId === user.id);
    userProducts.sort((a, b) => b.createdAt - a.createdAt);
    setProducts(userProducts);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      quantity: String(product.quantity),
      price: formatCurrency(String(Math.round(product.price * 100))),
      description: product.description || "",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do produto.");
      return;
    }
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
      Alert.alert("Campo inválido", "Informe uma quantidade válida.");
      return;
    }
    if (!form.price) {
      Alert.alert("Campo obrigatório", "Informe o valor do produto.");
      return;
    }

    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const stored = await AsyncStorage.getItem("products");
    let list = stored ? JSON.parse(stored) : [];

    if (editingProduct) {
      list = list.map((p) =>
        p.productId === editingProduct.productId
          ? {
              ...p,
              name: form.name.trim(),
              quantity: parseInt(form.quantity, 10),
              price: parseCurrency(form.price),
              description: form.description.trim(),
              updatedAt: Date.now(),
            }
          : p
      );
    } else {
      const newProduct = {
        productId: `prod_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: user.id,
        name: form.name.trim(),
        quantity: parseInt(form.quantity, 10),
        price: parseCurrency(form.price),
        description: form.description.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      list.push(newProduct);
    }

    await AsyncStorage.setItem("products", JSON.stringify(list));
    closeModal();
    loadProducts();
  };

  const handleDelete = (product) => {
    Alert.alert(
      "Excluir produto",
      `Tem certeza que deseja excluir "${product.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const stored = await AsyncStorage.getItem("products");
            let list = stored ? JSON.parse(stored) : [];
            list = list.filter((p) => p.productId !== product.productId);
            await AsyncStorage.setItem("products", JSON.stringify(list));
            loadProducts();
          },
        },
      ]
    );
  };

  const toggleExpand = (productId) => {
    setExpandedId((prev) => (prev === productId ? null : productId));
  };

  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
          Produtos
        </Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="boxes-stacked" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{products.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Produtos</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="cubes" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalStock}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Em estoque</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="sack-dollar" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Valor total</Text>
          </View>
        </View>

        {/* Lista de produtos */}
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="box-open" size={48} color={colors.mediumRed} style={{ opacity: 0.4 }} />
            <Text style={[styles.empty, { color: colors.text }]}>
              Nenhum produto cadastrado ainda.
            </Text>
          </View>
        ) : (
          products.map((product) => {
            const isExpanded = expandedId === product.productId;
            return (
              <TouchableOpacity
                key={product.productId}
                activeOpacity={0.85}
                onPress={() => toggleExpand(product.productId)}
              >
                <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
                  <Card.Title
                    title={product.name}
                    subtitle={`Qtd: ${product.quantity}  •  R$ ${product.price.toFixed(2).replace(".", ",")}`}
                    titleStyle={{ fontSize: 17, fontWeight: "600", color: colors.text }}
                    subtitleStyle={{ opacity: 0.7, color: colors.text }}
                    left={() => (
                      <View style={[styles.iconContainer, { backgroundColor: colors.mediumRedOpaque }]}>
                        <FontAwesome6 name="box" size={18} color={colors.mediumRed} />
                      </View>
                    )}
                    right={() => (
                      <FontAwesome6
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={14}
                        color={colors.text}
                        style={{ marginRight: 16, opacity: 0.5 }}
                      />
                    )}
                  />

                  {isExpanded && (
                    <Card.Content style={styles.expandedContent}>
                      {product.description ? (
                        <Text style={[styles.descriptionText, { color: colors.text }]}>
                          <FontAwesome6 name="align-left" size={14} color={colors.mediumRed} />{" "}
                          {product.description}
                        </Text>
                      ) : null}

                      <Text style={[styles.detailText, { color: colors.text }]}>
                        <FontAwesome6 name="calendar" size={14} color={colors.mediumRed} />{" "}
                        Cadastrado em: {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                      </Text>

                      <View style={styles.actionRow}>
                        <Button
                          mode="contained"
                          onPress={() => openEditModal(product)}
                          style={[styles.actionButton, { backgroundColor: colors.mediumRed }]}
                          labelStyle={{ color: "#fff", fontSize: 13 }}
                          icon="pencil"
                        >
                          Editar
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => handleDelete(product)}
                          style={[styles.actionButton, { borderColor: colors.mediumRed }]}
                          labelStyle={{ color: colors.mediumRed, fontSize: 13 }}
                          icon="trash-can-outline"
                        >
                          Excluir
                        </Button>
                      </View>
                    </Card.Content>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão flutuante */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.mediumRed }]}
        onPress={openCreateModal}
        activeOpacity={0.85}
      >
        <FontAwesome6 name="plus" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Modal de cadastro / edição */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Nome */}
            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Ex: Camiseta Básica"
              placeholderTextColor={colors.text + "66"}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
            />

            {/* Quantidade e Valor na mesma linha */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: colors.text }]}>Quantidade *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                  placeholder="0"
                  placeholderTextColor={colors.text + "66"}
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={(v) => setForm({ ...form, quantity: v.replace(/\D/g, "") })}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.text }]}>Valor (R$) *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                  placeholder="0,00"
                  placeholderTextColor={colors.text + "66"}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(v) => setForm({ ...form, price: formatCurrency(v) })}
                />
              </View>
            </View>

            {/* Descrição */}
            <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
              placeholder="Detalhes adicionais do produto..."
              placeholderTextColor={colors.text + "66"}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Botões */}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={closeModal}
                style={[styles.modalBtn, { borderColor: colors.mediumRed }]}
                labelStyle={{ color: colors.mediumRed }}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]}
                labelStyle={{ color: "#fff" }}
              >
                {editingProduct ? "Salvar" : "Cadastrar"}
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "600" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    elevation: 2,
    gap: 4,
  },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  summaryLabel: { fontSize: 11, opacity: 0.6 },

  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  empty: { textAlign: "center", opacity: 0.5, fontSize: 15 },

  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  iconContainer: { padding: 10, borderRadius: 12 },

  expandedContent: { paddingTop: 4, paddingBottom: 8, gap: 6 },
  descriptionText: { fontSize: 14, opacity: 0.8, marginBottom: 4 },
  detailText: { fontSize: 13, opacity: 0.7 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 10 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000090",
    justifyContent: "flex-end",
  },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4, marginTop: 10, opacity: 0.8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: { height: 80, paddingTop: 10 },
  row: { flexDirection: "row" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, borderRadius: 12 },
});