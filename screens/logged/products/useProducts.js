import { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { formatCurrency, parseCurrency } from "../shared/helpers";
import { getSession } from "../../../functions/shared/secureStorage";
import { handleMessage } from "../../../components/general/ToastMessage";
import {
    initDatabase,
    getProducts,
    getProductsPaged,
    upsertProduct,
    deleteProduct,
} from "../shared/database";

const PAGE_SIZE  = 30;
const EMPTY_FORM = { name: "", quantity: "", price: "", description: "", category: "Outros", imageUri: "" };

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
    // ── Lista paginada ──────────────────────────────────────────────────────
    const [products,    setProducts]    = useState([]);   // página atual
    const [allProducts, setAllProducts] = useState([]);   // sem filtro (para totais)
    const [page,        setPage]        = useState(1);
    const [totalPages,  setTotalPages]  = useState(1);
    const [totalItems,  setTotalItems]  = useState(0);

    // ── Form / modais ───────────────────────────────────────────────────────
    const [modalVisible,   setModalVisible]   = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form,           setForm]           = useState(EMPTY_FORM);
    const [expandedId,     setExpandedId]     = useState(null);

    // ── Busca ───────────────────────────────────────────────────────────────
    const [searchQuery,   setSearchQuery]   = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    // ── Confirmação de exclusão ──────────────────────────────────────────────
    const [confirmDelete, setConfirmDelete] = useState({ visible: false, product: null });

    // Debounce da busca
    const searchTimer = useRef(null);

    // ── Carregar ─────────────────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            loadTotals();
            loadPage(1, "");
        }, [])
    );

    /** Carrega todos os produtos SEM filtro apenas para calcular totais do header. */
    const loadTotals = async () => {
        const user = await getSession();
        if (!user) return;
        setAllProducts(getProducts(user.id));
    };

    /**
     * Carrega uma página específica do banco.
     * @param {number} targetPage — 1-based
     * @param {string} query
     */
    const loadPage = async (targetPage, query) => {
        const user = await getSession();
        if (!user) return;
        const { items, total, totalPages: tp } = getProductsPaged(user.id, targetPage, query);
        setProducts(items);
        setPage(targetPage);
        setTotalItems(total);
        setTotalPages(tp);
    };

    // ── Controles de página ───────────────────────────────────────────────────

    const goToPage = (p) => {
        const clamped = Math.max(1, Math.min(p, totalPages));
        loadPage(clamped, searchQuery);
    };

    const goNext = () => goToPage(page + 1);
    const goPrev = () => goToPage(page - 1);

    // ── Busca com debounce ────────────────────────────────────────────────────

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            loadPage(1, text);
        }, 300);
    };

    const toggleSearch = () => {
        setSearchVisible((v) => {
            if (v) {
                setSearchQuery("");
                loadPage(1, "");
            }
            return !v;
        });
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
            imageUri:    product.imageUri || "",
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
                imageUri:    form.imageUri || "",
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
                imageUri:    form.imageUri || "",
                createdAt:   now,
                updatedAt:   now,
            };

        upsertProduct(product);
        closeModal();
        // Ao criar, volta à página 1; ao editar, mantém a página atual
        const targetPage = editingProduct ? page : 1;
        loadTotals();
        loadPage(targetPage, searchQuery);
    };

    /** Abre modal de confirmação — a ação real fica em _doDelete */
    const handleDelete = (product) =>
        setConfirmDelete({ visible: true, product });

    const _doDelete = () => {
        deleteProduct(confirmDelete.product.productId);
        loadTotals();
        // Se era o último item da página, recua uma página
        const newTotal = totalItems - 1;
        const maxPage  = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
        const target   = Math.min(page, maxPage);
        loadPage(target, searchQuery);
    };

    // ── Expand ────────────────────────────────────────────────────────────────

    const toggleExpand = (productId) =>
        setExpandedId((prev) => (prev === productId ? null : productId));

    // ── Derivados ─────────────────────────────────────────────────────────────

    const totalStock = allProducts.reduce((acc, p) => acc + p.quantity, 0);
    const totalValue = allProducts.reduce((acc, p) => acc + p.price * p.quantity, 0);

    return {
        products,           // página atual (já filtrada/paginada)
        allProducts,        // todos (sem filtro) — para os cards de resumo
        page,
        totalPages,
        totalItems,
        pageSize: PAGE_SIZE,
        goNext,
        goPrev,
        goToPage,
        modalVisible,
        editingProduct,
        form,
        setForm,
        expandedId,
        totalStock,
        totalValue,
        searchQuery,
        handleSearchChange,  // usa debounce interno
        setSearchQuery,      // expõe para limpar manualmente
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