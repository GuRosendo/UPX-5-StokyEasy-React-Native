import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatCurrency, parseCurrency } from "../shared/helpers";

const EMPTY_FORM = { name: "", quantity: "", price: "", description: "" };

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState(null);

  // ── Carregar ────────────────────────────────────────────────────────────────

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
    const userProducts = list
      .filter((p) => p.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    setProducts(userProducts);
  };

  // ── Modal ───────────────────────────────────────────────────────────────────

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

  // ── CRUD ────────────────────────────────────────────────────────────────────

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
      list.push({
        productId: `prod_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: user.id,
        name: form.name.trim(),
        quantity: parseInt(form.quantity, 10),
        price: parseCurrency(form.price),
        description: form.description.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
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

  // ── Expand ──────────────────────────────────────────────────────────────────

  const toggleExpand = (productId) =>
    setExpandedId((prev) => (prev === productId ? null : productId));

  // ── Derivados ───────────────────────────────────────────────────────────────

  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return {
    products,
    modalVisible,
    editingProduct,
    form,
    setForm,
    expandedId,
    totalStock,
    totalValue,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    toggleExpand,
  };
}
