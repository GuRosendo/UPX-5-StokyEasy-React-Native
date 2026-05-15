import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { formatCurrency, parseCurrency } from "../shared/helpers";
import { getSession } from "../../../functions/shared/secureStorage";
import { handleMessage } from "../../../components/general/ToastMessage";
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
    const [products,      setProducts]      = useState([]);
    const [modalVisible,  setModalVisible]  = useState(false);
    const [editingProduct,setEditingProduct]= useState(null);
    const [form,          setForm]          = useState(EMPTY_FORM);
    const [expandedId,    setExpandedId]    = useState(null);
    const [searchQuery,   setSearchQuery]   = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    // Modal de confirmação de exclusão
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, product: null });

    // ── Carregar ─────────────────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        const user = await getSession();
        if (!user) return;
        const list = getProducts(user.id);
        setProducts(list);
    };

    // ── Modal ─────────────────────────────────────────────────────────────────

    const openCreateModal = () => {
        setEditingProduct(null);
        setForm(EMPTY_FORM);
        setModalVisible(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            name:        product.name,
            quantity:    String(product.quantity),
            price:       formatCurrency(String(Math.round(product.price * 100))),
            description: product.description || "",
            category:    product.category || "Outros",
        });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingProduct(null);
        setForm(EMPTY_FORM);
    };

    // ── CRUD ──────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!form.name.trim()) {
            handleMessage(false, "Campo obrigatório", "Informe o nome do produto.");
            return;
        }
        if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
            handleMessage(false, "Campo inválido", "Informe uma quantidade válida.");
            return;
        }
        if (!form.price) {
            handleMessage(false, "Campo obrigatório", "Informe o valor do produto.");
            return;
        }

        const user = await getSession();
        if (!user) return;

        const now = Date.now();
        const product = editingProduct
            ? {
                ...editingProduct,
                name:        form.name.trim(),
                quantity:    parseInt(form.quantity, 10),
                price:       parseCurrency(form.price),
                description: form.description.trim(),
                category:    form.category,
                updatedAt:   now,
            }
            : {
                productId:   `prod_${now}_${Math.random().toString(36).slice(2)}`,
                userId:      user.id,
                name:        form.name.trim(),
                quantity:    parseInt(form.quantity, 10),
                price:       parseCurrency(form.price),
                description: form.description.trim(),
                category:    form.category,
                createdAt:   now,
                updatedAt:   now,
            };

        upsertProduct(product);
        closeModal();
        loadProducts();
    };

    // Abre modal de confirmação — a ação real fica em _doDelete
    const handleDelete = (product) =>
        setConfirmDelete({ visible: true, product });

    const _doDelete = () => {
        deleteProduct(confirmDelete.product.productId);
        loadProducts();
    };

    // ── Expand ────────────────────────────────────────────────────────────────

    const toggleExpand = (productId) =>
        setExpandedId((prev) => (prev === productId ? null : productId));

    // ── Busca ─────────────────────────────────────────────────────────────────

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

    // ── Derivados ─────────────────────────────────────────────────────────────

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
        // confirmação de exclusão (consumido pela ProductsScreen)
        confirmDelete, setConfirmDelete, _doDelete,
    };
}