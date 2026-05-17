import { useCallback, useState, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { parseCurrency } from "../shared/helpers";
import { getSession } from "../../../functions/shared/secureStorage";
import { handleMessage } from "../../../components/general/ToastMessage";
import {
    initDatabase,
    getClients,
    getClientsPaged,
    upsertClient,
    deleteClient,
    getProducts,
    updateProductQuantity,
    insertOrder,
    updateOrderCore,
    updateOrderStatus,
    updateOrderTotalValue,
    deleteOrder,
    setInstallmentPaid,
    insertInstallment,
    updateInstallmentValue,
    updateInstallmentDueDate,
    deleteInstallment,
    reindexInstallments,
} from "../shared/database";

const PAGE_SIZE     = 30;
const EMPTY_CLIENT  = { name: "", email: "", phone: "" };
const EMPTY_ORDER_ITEM = { productId: "", quantity: "", installments: "" };

function addMonths(ts, n) {
    const d = new Date(ts);
    d.setMonth(d.getMonth() + n);
    return d.getTime();
}

export function useClients() {
    // ── Lista paginada ──────────────────────────────────────────────────────
    const [clients,      setClients]      = useState([]);  // página atual (com pedidos)
    const [allClients,   setAllClients]   = useState([]);  // todos (sem filtro) — para totais
    const [page,         setPage]         = useState(1);
    const [totalPages,   setTotalPages]   = useState(1);
    const [totalItems,   setTotalItems]   = useState(0);

    const [userProducts,     setUserProducts]     = useState([]);
    const [expandedClientId, setExpandedClientId] = useState(null);
    const [expandedOrderId,  setExpandedOrderId]  = useState(null);

    // Modal cliente
    const [clientModal,   setClientModal]   = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [clientForm,    setClientForm]    = useState(EMPTY_CLIENT);

    // Modal novo pedido
    const [orderModal,        setOrderModal]        = useState(false);
    const [selectedClientId,  setSelectedClientId]  = useState(null);
    const [orderItems,        setOrderItems]        = useState([{ ...EMPTY_ORDER_ITEM }]);
    const [pickerOpenIndex,   setPickerOpenIndex]   = useState(null);
    const [orderFirstDueDate, setOrderFirstDueDate] = useState(null);

    // Modal editar pedido
    const [editOrderModal,   setEditOrderModal]   = useState(false);
    const [editingOrder,     setEditingOrder]     = useState(null);
    const [editingClientId,  setEditingClientId]  = useState(null);
    const [editingClientObj, setEditingClientObj] = useState(null);

    // Modal parcela
    const [addInstallmentModal, setAddInstallmentModal] = useState(false);
    const [addInstallmentValue, setAddInstallmentValue] = useState("");
    const [selectedOrderId,     setSelectedOrderId]     = useState(null);

    // Busca
    const [searchQuery,   setSearchQuery]   = useState("");
    const [searchVisible, setSearchVisible] = useState(false);

    // Filtro de pedidos finalizados
    const [showCompleted, setShowCompleted] = useState(false);

    // Debounce da busca
    const searchTimer = useRef(null);

    // Refs para evitar stale closure nas callbacks assíncronas
    const searchQueryRef   = useRef("");
    const showCompletedRef = useRef(false);
    const pageRef          = useRef(1);

    // ── Modais de confirmação ─────────────────────────────────────────────────
    const [confirmDeleteClient,        setConfirmDeleteClient]        = useState({ visible: false, client: null });
    const [confirmCancelOrder,         setConfirmCancelOrder]         = useState({ visible: false, clientId: null, orderId: null });
    const [confirmDeleteOrder,         setConfirmDeleteOrder]         = useState({ visible: false, clientId: null, orderId: null });
    const [confirmRecoverOrder,        setConfirmRecoverOrder]        = useState({ visible: false, clientId: null, orderId: null });
    const [confirmCompleteOrder,       setConfirmCompleteOrder]       = useState({ visible: false, clientId: null, orderId: null });
    const [confirmDeleteCancelled,     setConfirmDeleteCancelled]     = useState({ visible: false, clientId: null, orderId: null });
    const [confirmPayInstallment,      setConfirmPayInstallment]      = useState({ visible: false, clientId: null, orderId: null, installmentId: null });
    const [confirmUnpayInstallment,    setConfirmUnpayInstallment]    = useState({ visible: false, clientId: null, orderId: null, installmentId: null });
    const [confirmAllPaidComplete,     setConfirmAllPaidComplete]     = useState({ visible: false, orderId: null });

    // ── Carregar ─────────────────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            loadTotals();
            loadPage(1, "", false);
            loadProducts();
        }, [])
    );

    /** Carrega TODOS os clientes (sem filtro/paginação) apenas para calcular totais. */
    const loadTotals = async () => {
        const user = await getSession();
        if (!user) return;
        setAllClients(getClients(user.id));
    };

    const loadProducts = async () => {
        const user = await getSession();
        if (!user) return;
        setUserProducts(getProducts(user.id));
    };

    /**
     * Carrega uma página de clientes do banco.
     * @param {number} targetPage
     * @param {string} query
     * @param {boolean} completed
     */
    const loadPage = async (targetPage, query, completed) => {
        const user = await getSession();
        if (!user) return;
        const { items, total, totalPages: tp } = getClientsPaged(
            user.id, targetPage, query, completed
        );
        setClients(items);
        setPage(targetPage);
        setTotalItems(total);
        setTotalPages(tp);
        // Mantém refs sincronizadas para evitar stale closures
        pageRef.current          = targetPage;
        searchQueryRef.current   = query;
        showCompletedRef.current = completed;
    };

    // helper interno — lê sempre os valores atuais via refs (sem stale closure)
    const reload = (targetPage) =>
        loadPage(
            targetPage ?? pageRef.current,
            searchQueryRef.current,
            showCompletedRef.current,
        );

    // ── Controles de página ───────────────────────────────────────────────────

    const goToPage = (p) => {
        const clamped = Math.max(1, Math.min(p, totalPages));
        reload(clamped);
    };

    const goNext = () => goToPage(page + 1);
    const goPrev = () => goToPage(page - 1);

    // ── Busca com debounce ────────────────────────────────────────────────────

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        searchQueryRef.current = text;
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            loadPage(1, text, showCompletedRef.current);
        }, 300);
    };

    const toggleSearch = () => {
        setSearchVisible((v) => {
            if (v) {
                setSearchQuery("");
                searchQueryRef.current = "";
                loadPage(1, "", showCompletedRef.current);
            }
            return !v;
        });
    };

    // Quando alterna entre pedidos ativos ↔ finalizados, volta à página 1
    const handleSetShowCompleted = (val) => {
        setShowCompleted(val);
        showCompletedRef.current = val;
        loadPage(1, searchQueryRef.current, val);
    };

    // ── CRUD Clientes ─────────────────────────────────────────────────────────

    const openCreateClient = () => {
        setEditingClient(null);
        setClientForm(EMPTY_CLIENT);
        setClientModal(true);
    };

    const openEditClient = (client) => {
        setEditingClient(client);
        setClientForm({ name: client.name, email: client.email, phone: client.phone });
        setClientModal(true);
    };

    const closeClientModal = () => {
        setClientModal(false);
        setEditingClient(null);
        setClientForm(EMPTY_CLIENT);
    };

    const handleSaveClient = async () => {
        if (!clientForm.name.trim()) {
            handleMessage(false, "Campo obrigatório", "Informe o nome do cliente.");
            return;
        }
        const user = await getSession();
        if (!user) return;
        const now = Date.now();
        upsertClient(
            editingClient
                ? {
                    ...editingClient,
                    name:  clientForm.name.trim(),
                    email: clientForm.email.trim(),
                    phone: clientForm.phone,
                }
                : {
                    clientId:  `cli_${now}_${Math.random().toString(36).slice(2)}`,
                    userId:    user.id,
                    name:      clientForm.name.trim(),
                    email:     clientForm.email.trim(),
                    phone:     clientForm.phone,
                    createdAt: now,
                }
        );
        closeClientModal();
        loadTotals();
        const targetPage = editingClient ? page : 1;
        loadPage(targetPage, searchQueryRef.current, showCompletedRef.current);
    };

    const handleDeleteClient = (client) =>
        setConfirmDeleteClient({ visible: true, client });

    const _doDeleteClient = () => {
        deleteClient(confirmDeleteClient.client.clientId);
        loadTotals();
        const newTotal = totalItems - 1;
        const maxPage  = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
        reload(Math.min(page, maxPage));
    };

    // ── Novo pedido ───────────────────────────────────────────────────────────

    const openCreateOrder = (clientId) => {
        setSelectedClientId(clientId);
        setOrderItems([{ ...EMPTY_ORDER_ITEM }]);
        setPickerOpenIndex(null);
        setExpandedOrderId(null);
        setOrderFirstDueDate(null);
        setOrderModal(true);
    };

    const closeOrderModal = () => {
        setOrderModal(false);
        setSelectedClientId(null);
        setOrderItems([{ ...EMPTY_ORDER_ITEM }]);
        setPickerOpenIndex(null);
        setOrderFirstDueDate(null);
    };

    const addOrderItem    = () => { setOrderItems((p) => [...p, { ...EMPTY_ORDER_ITEM }]); setPickerOpenIndex(null); };
    const removeOrderItem = (i) => { setOrderItems((p) => p.filter((_, j) => j !== i));   setPickerOpenIndex(null); };
    const updateOrderItem = (index, field, value) =>
        setOrderItems((prev) => {
            const u = [...prev];
            u[index] = { ...u[index], [field]: value };
            return u;
        });

    const handleSaveOrder = async () => {
        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            const qty  = parseInt(item.quantity, 10);
            const inst = parseInt(item.installments, 10);
            if (!item.productId) { handleMessage(false, "Produto obrigatório", `Selecione um produto no item ${i + 1}.`); return; }
            if (!qty || qty <= 0) { handleMessage(false, "Campo inválido", `Quantidade inválida no item ${i + 1}.`); return; }
            if (!item.aVista && (!inst || inst <= 0)) { handleMessage(false, "Campo inválido", `Nº de parcelas inválido no item ${i + 1}.`); return; }
        }

        const user = await getSession();
        if (!user) return;

        const now = Date.now();

        for (const item of orderItems) {
            const prod = userProducts.find((p) => p.productId === item.productId);
            if (!prod) continue;
            const qty  = parseInt(item.quantity, 10);
            const inst = item.aVista ? 1 : parseInt(item.installments, 10);

            if (qty > prod.quantity) {
                handleMessage(false, "Estoque insuficiente", `Disponível: ${prod.quantity} un. de "${prod.name}".`);
                return;
            }

            const total = prod.price * qty;
            const installmentValue = parseFloat((total / inst).toFixed(2));

            const installmentsList = Array.from({ length: inst }, (_, idx) => ({
                installmentId: `inst_${now}_${idx}_${Math.random().toString(36).slice(2)}`,
                index:         idx + 1,
                value:         idx === inst - 1
                    ? parseFloat((total - installmentValue * (inst - 1)).toFixed(2))
                    : installmentValue,
                dueDate: orderFirstDueDate
                    ? addMonths(orderFirstDueDate, idx)
                    : null,
            }));

            const order = {
                orderId:    `ord_${now}_${Math.random().toString(36).slice(2)}`,
                clientId:   selectedClientId,
                userId:     user.id,
                totalValue: total,
                quantity:   qty,
                status:     item.aVista ? "completed" : "active",
                productRef: prod.name,
                productId:  prod.productId,
                createdAt:  now,
                installments: installmentsList,
            };

            insertOrder(order);
            updateProductQuantity(prod.productId, prod.quantity - qty);
        }

        closeOrderModal();
        loadTotals();
        reload();
        loadProducts();
    };

    // ── Editar pedido ─────────────────────────────────────────────────────────

    const openEditOrder = (clientId, order) => {
        setEditingClientId(clientId);
        setEditingOrder(order);
        const client = clients.find((c) => c.clientId === clientId);
        setEditingClientObj(client ?? null);
        setEditOrderModal(true);
    };

    const closeEditOrderModal = () => {
        setEditOrderModal(false);
        setEditingOrder(null);
        setEditingClientId(null);
        setEditingClientObj(null);
    };

    const handleSaveEditedOrder = (updatedOrder) => {
        if (!updatedOrder) return;
        updateOrderCore(updatedOrder.orderId, {
            totalValue: updatedOrder.totalValue,
            quantity:   updatedOrder.quantity,
            productRef: updatedOrder.productRef,
            productId:  updatedOrder.productId,
        });
        for (const inst of updatedOrder.installments) {
            updateInstallmentValue(inst.installmentId, inst.value);
            updateInstallmentDueDate(inst.installmentId, inst.dueDate ?? null);
        }
        closeEditOrderModal();
        loadTotals();
        reload();
    };

    // ── Ações de pedido ───────────────────────────────────────────────────────

    const handleCancelOrder = (clientId, orderId) =>
        setConfirmCancelOrder({ visible: true, clientId, orderId });

    const _doCancelOrder = () => {
        const { clientId, orderId } = confirmCancelOrder;
        const client = clients.find((c) => c.clientId === clientId)
            ?? allClients.find((c) => c.clientId === clientId);
        const order  = client?.orders?.find((o) => o.orderId === orderId);
        if (order?.productId && order?.quantity) {
            const prod = userProducts.find((p) => p.productId === order.productId);
            if (prod) updateProductQuantity(prod.productId, prod.quantity + order.quantity);
        }
        updateOrderStatus(orderId, "cancelled");
        loadTotals();
        reload();
        loadProducts();
    };

    const handleDeleteOrder = (clientId, orderId) =>
        setConfirmDeleteOrder({ visible: true, clientId, orderId });

    const _doDeleteOrder = () => {
        const { orderId } = confirmDeleteOrder;
        deleteOrder(orderId);
        loadTotals();
        reload();
    };

    const handleRecoverOrder = (clientId, orderId) =>
        setConfirmRecoverOrder({ visible: true, clientId, orderId });

    const _doRecoverOrder = () => {
        const { clientId, orderId } = confirmRecoverOrder;
        const client = clients.find((c) => c.clientId === clientId)
            ?? allClients.find((c) => c.clientId === clientId);
        const order  = client?.orders?.find((o) => o.orderId === orderId);
        if (order?.productId && order?.quantity) {
            const prod = userProducts.find((p) => p.productId === order.productId);
            if (prod) {
                if (prod.quantity < order.quantity) {
                    handleMessage(
                        false,
                        "Estoque insuficiente",
                        `Disponível: ${prod.quantity} un. de "${prod.name}". Ajuste o estoque antes de recuperar.`
                    );
                    return;
                }
                updateProductQuantity(prod.productId, prod.quantity - order.quantity);
            }
        }
        updateOrderStatus(orderId, "active");
        loadTotals();
        reload();
        loadProducts();
    };

    const handleCompleteOrder = (clientId, orderId) =>
        setConfirmCompleteOrder({ visible: true, clientId, orderId });

    const _doCompleteOrder = (orderId) => {
        const id = orderId ?? confirmCompleteOrder.orderId;
        updateOrderStatus(id, "completed");
        loadTotals();
        reload();
    };

    const handleDeleteCancelledOrder = (clientId, orderId) =>
        setConfirmDeleteCancelled({ visible: true, clientId, orderId });

    const _doDeleteCancelledOrder = () => {
        deleteOrder(confirmDeleteCancelled.orderId);
        loadTotals();
        reload();
    };

    // ── Parcelas ──────────────────────────────────────────────────────────────

    const handlePayInstallment = (clientId, orderId, installmentId) =>
        setConfirmPayInstallment({ visible: true, clientId, orderId, installmentId });

    const _doPayInstallment = () => {
        const { clientId, orderId, installmentId } = confirmPayInstallment;
        setInstallmentPaid(installmentId, true);
        const client = clients.find((c) => c.clientId === clientId);
        const order  = client?.orders?.find((o) => o.orderId === orderId);
        if (order) {
            const allPaid = order.installments.every(
                (i) => i.installmentId === installmentId ? true : i.paid
            );
            if (allPaid && order.installments.length > 0) {
                loadTotals();
                reload();
                setConfirmAllPaidComplete({ visible: true, orderId });
            } else {
                loadTotals();
                reload();
            }
        } else {
            loadTotals();
            reload();
        }
    };

    const handleUnpayInstallment = (clientId, orderId, installmentId) =>
        setConfirmUnpayInstallment({ visible: true, clientId, orderId, installmentId });

    const _doUnpayInstallment = () => {
        setInstallmentPaid(confirmUnpayInstallment.installmentId, false);
        loadTotals();
        reload();
    };

    const openAddInstallment = (orderId) => {
        setSelectedOrderId(orderId);
        setAddInstallmentValue("");
        setAddInstallmentModal(true);
    };

    const handleAddInstallment = (clientId) => {
        const value = parseCurrency(addInstallmentValue);
        if (!value || value <= 0) {
            handleMessage(false, "Valor inválido", "Informe um valor válido para a parcela.");
            return;
        }
        const client = clients.find((c) => c.clientId === clientId);
        const order  = client?.orders?.find((o) => o.orderId === selectedOrderId);
        if (!order) return;
        insertInstallment({
            installmentId: `inst_${Date.now()}`,
            orderId:       selectedOrderId,
            index:         order.installments.length + 1,
            value,
            dueDate:       null,
        });
        updateOrderTotalValue(selectedOrderId, order.totalValue + value);
        setAddInstallmentModal(false);
        setSelectedOrderId(null);
        loadTotals();
        reload();
    };

    // ── Expand ────────────────────────────────────────────────────────────────

    const toggleClient = (id) => setExpandedClientId((p) => (p === id ? null : id));
    const toggleOrder  = (id) => setExpandedOrderId((p)  => (p === id ? null : id));

    // ── Derivados (sobre allClients — dados completos) ────────────────────────

    const totalClients      = allClients.length;
    const totalActiveOrders = allClients.reduce(
        (acc, c) => acc + (c.orders || []).filter((o) => o.status === "active").length, 0
    );
    const totalPending = allClients.reduce(
        (acc, c) =>
            acc +
            (c.orders || [])
                .filter((o) => o.status === "active")
                .reduce(
                    (s, o) => s + o.installments.filter((i) => !i.paid).reduce((a, i) => a + i.value, 0),
                    0
                ),
        0
    );
    const totalCompleted = allClients.reduce(
        (acc, c) => acc + (c.orders || []).filter((o) => o.status === "completed").length, 0
    );

    // Filtra os pedidos dentro de cada cliente da página conforme showCompleted
    const clientsForDisplay = clients.map((c) => ({
        ...c,
        orders: (c.orders || []).filter((o) =>
            showCompleted ? o.status === "completed" : o.status !== "completed"
        ),
    }));

    return {
        clients: clientsForDisplay,
        allClients,
        userProducts,
        expandedClientId,
        expandedOrderId,
        // paginação
        page, totalPages, totalItems,
        pageSize: PAGE_SIZE,
        goNext, goPrev, goToPage,
        totalClients,
        totalActiveOrders,
        totalPending,
        totalCompleted,
        searchQuery, handleSearchChange, setSearchQuery,
        searchVisible, toggleSearch,
        showCompleted, setShowCompleted: handleSetShowCompleted,
        // modal cliente
        clientModal, editingClient, clientForm, setClientForm,
        openCreateClient, openEditClient, closeClientModal, handleSaveClient, handleDeleteClient,
        // modal novo pedido
        orderModal, orderItems, pickerOpenIndex, setPickerOpenIndex,
        orderFirstDueDate, setOrderFirstDueDate,
        openCreateOrder, closeOrderModal, addOrderItem, removeOrderItem, updateOrderItem, handleSaveOrder,
        // modal editar pedido
        editOrderModal, editingOrder, editingClientId, editingClientObj,
        openEditOrder, closeEditOrderModal, handleSaveEditedOrder,
        // modal parcela
        addInstallmentModal, addInstallmentValue, setAddInstallmentValue,
        selectedOrderId, openAddInstallment, handleAddInstallment, setAddInstallmentModal,
        // ações
        handlePayInstallment, handleUnpayInstallment,
        handleCancelOrder, handleDeleteOrder,
        handleCompleteOrder,
        handleRecoverOrder, handleDeleteCancelledOrder,
        toggleClient, toggleOrder,
        // confirmações
        confirmDeleteClient,    setConfirmDeleteClient,    _doDeleteClient,
        confirmCancelOrder,     setConfirmCancelOrder,     _doCancelOrder,
        confirmDeleteOrder,     setConfirmDeleteOrder,     _doDeleteOrder,
        confirmRecoverOrder,    setConfirmRecoverOrder,    _doRecoverOrder,
        confirmCompleteOrder,   setConfirmCompleteOrder,   _doCompleteOrder,
        confirmDeleteCancelled, setConfirmDeleteCancelled, _doDeleteCancelledOrder,
        confirmPayInstallment,  setConfirmPayInstallment,  _doPayInstallment,
        confirmUnpayInstallment,setConfirmUnpayInstallment,_doUnpayInstallment,
        confirmAllPaidComplete, setConfirmAllPaidComplete,
    };
}