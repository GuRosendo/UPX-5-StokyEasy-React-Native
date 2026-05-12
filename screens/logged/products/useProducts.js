import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatCurrency, parseCurrency } from "../shared/helpers";
import {
  initDatabase,
  getProducts,
  upsertProduct,
  deleteProduct,
} from "../shared/database";

const EMPTY_FORM = { name: "", quantity: "", price: "", description: "", category: "Outros" };

export const PRODUCT_CATEGORIES = [
  "Joias e Acessórios", 
  "Alimentos", 
  "Bebidas",
  "Perecíveis",
  "Higiene & Limpeza",
  "Roupas & Calçados",
  "Eletrodomésticos",
  "Eletrônicos",
  "Móveis & Decoração",
  "Ferramentas",
  "Papelaria",
  "Brinquedos",
  "Saúde & Beleza",
  "Automotivo",
  "Esportes",
  "Outros",
];

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  // ── Carregar ────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      initDatabase();
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);
    const list = getProducts(user.id);
    setProducts(list);
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
      category: product.category || "Outros",
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

    const now = Date.now();
    const product = editingProduct
      ? {
          ...editingProduct,
          name: form.name.trim(),
          quantity: parseInt(form.quantity, 10),
          price: parseCurrency(form.price),
          description: form.description.trim(),
          category: form.category,
          updatedAt: now,
        }
      : {
          productId: `prod_${now}_${Math.random().toString(36).slice(2)}`,
          userId: user.id,
          name: form.name.trim(),
          quantity: parseInt(form.quantity, 10),
          price: parseCurrency(form.price),
          description: form.description.trim(),
          category: form.category,
          createdAt: now,
          updatedAt: now,
        };

    upsertProduct(product);
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
          onPress: () => {
            deleteProduct(product.productId);
            loadProducts();
          },
        },
      ]
    );
  };

  // ── Expand ──────────────────────────────────────────────────────────────────

  const toggleExpand = (productId) =>
    setExpandedId((prev) => (prev === productId ? null : productId));

  // ── Busca ────────────────────────────────────────────────────────────────────

  const toggleSearch = () => {
    setSearchVisible((v) => {
      if (v) setSearchQuery("");
      return !v;
    });
  };

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // ── Derivados ───────────────────────────────────────────────────────────────

  const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  return {
    products: filteredProducts,
    allProducts: products,
    modalVisible,
    editingProduct,
    form,
    setForm,
    expandedId,
    totalStock,
    totalValue,
    searchQuery,
    setSearchQuery,
    searchVisible,
    toggleSearch,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    toggleExpand,
  };
}
