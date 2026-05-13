import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { parseCurrency } from "../shared/helpers";
import { getSession } from "../../../functions/shared/secureStorage";
import {
    initDatabase,
    getClients,
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

const EMPTY_CLIENT     = { name: "", email: "", phone: "" };
const EMPTY_ORDER_ITEM = { productId: "", quantity: "", installments: "" };

function addMonths(ts, n) {
    const d = new Date(ts);
    d.setMonth(d.getMonth() + n);
    return d.getTime();
}

export function useClients() {
    const [clients,          setClients]          = useState([]);
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

    // Filtro de pedidos pagos/finalizados
    const [showCompleted, setShowCompleted] = useState(false);

    // ── Carregar ─────────────────────────────────────────────────────────────

    useFocusEffect(
        useCallback(() => {
            initDatabase();
            loadData();
        }, [])
    );

    const loadData = async () => {
        const user = await getSession();
        if (!user) return;
        setClients(getClients(user.id).sort((a, b) => b.createdAt - a.createdAt));
        setUserProducts(getProducts(user.id));
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
            Alert.alert("Campo obrigatório", "Informe o nome do cliente.");
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
        loadData();
    };

    const handleDeleteClient = (client) => {
        Alert.alert(
            "Excluir cliente",
            `Excluir "${client.name}" e todos os seus pedidos?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => { deleteClient(client.clientId); loadData(); },
                },
            ]
        );
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
            if (!item.productId) { Alert.alert("Produto obrigatório", `Selecione um produto no item ${i + 1}.`); return; }
            if (!qty || qty <= 0) { Alert.alert("Campo inválido", `Quantidade inválida no item ${i + 1}.`); return; }
            if (!inst || inst <= 0) { Alert.alert("Campo inválido", `Nº de parcelas inválido no item ${i + 1}.`); return; }
        }

        const user = await getSession();
        if (!user) return;
        const products = getProducts(user.id);

        for (let i = 0; i < orderItems.length; i++) {
            const { productId, quantity } = orderItems[i];
            const qty  = parseInt(quantity, 10);
            const prod = products.find((p) => p.productId === productId);
            if (!prod) { Alert.alert("Erro", `Produto do item ${i + 1} não encontrado.`); return; }
            if (prod.quantity < qty) {
                Alert.alert("Estoque insuficiente", `Item ${i + 1}: disponível ${prod.quantity} un. de "${prod.name}".`);
                return;
            }
        }

        const now = Date.now();
        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            const qty  = parseInt(item.quantity, 10);
            const inst = parseInt(item.installments, 10);
            const prod = products.find((p) => p.productId === item.productId);
            const total = prod.price * qty;

            updateProductQuantity(prod.productId, prod.quantity - qty);
            insertOrder({
                orderId:    `ord_${now}_${i}_${Math.random().toString(36).slice(2)}`,
                clientId:   selectedClientId,
                userId:     user.id,
                totalValue: total,
                quantity:   qty,
                status:     "active",
                productRef: prod.name,
                productId:  prod.productId,
                createdAt:  now,
                installments: Array.from({ length: inst }, (_, j) => ({
                    installmentId: `inst_${now}_${i}_${j}`,
                    index:   j + 1,
                    value:   total / inst,
                    dueDate: orderFirstDueDate ? addMonths(orderFirstDueDate, j) : null,
                })),
            });
        }
        closeOrderModal();
        loadData();
    };

    // ── Editar pedido ─────────────────────────────────────────────────────────

    const openEditOrder = (clientId, order) => {
        const clientObj = clients.find((c) => c.clientId === clientId) ?? null;
        setEditingClientId(clientId);
        setEditingClientObj(clientObj);
        setEditingOrder(order);
        setEditOrderModal(true);
    };

    const closeEditOrderModal = () => {
        setEditOrderModal(false);
        setEditingOrder(null);
        setEditingClientId(null);
        setEditingClientObj(null);
    };

    const handleSaveEditedOrder = (updatedOrder, stockDeltas) => {
        for (const { productId, delta } of stockDeltas) {
            const prod = userProducts.find((p) => p.productId === productId);
            if (prod) updateProductQuantity(productId, prod.quantity + delta);
        }

        updateOrderCore(updatedOrder.orderId, {
            totalValue: updatedOrder.totalValue,
            quantity:   updatedOrder.quantity,
            productRef: updatedOrder.productRef,
            productId:  updatedOrder.productId,
        });

        const originalIds = new Set((editingOrder?.installments || []).map((i) => i.installmentId));
        const updatedIds  = new Set(updatedOrder.installments.map((i) => i.installmentId));

        for (const id of originalIds) {
            if (!updatedIds.has(id)) deleteInstallment(id);
        }

        for (const inst of updatedOrder.installments) {
            if (originalIds.has(inst.installmentId)) {
                updateInstallmentDueDate(inst.installmentId, inst.dueDate ?? null);
                if (!inst.paid) updateInstallmentValue(inst.installmentId, inst.value);
            } else {
                insertInstallment({
                    installmentId: inst.installmentId,
                    orderId:       updatedOrder.orderId,
                    index:         inst.index,
                    value:         inst.value,
                    dueDate:       inst.dueDate ?? null,
                });
            }
        }

        reindexInstallments(updatedOrder.orderId);
        closeEditOrderModal();
        loadData();
    };

    // ── Cancelar / excluir / recuperar pedido ─────────────────────────────────

    const handleCancelOrder = (clientId, orderId) => {
        Alert.alert("Cancelar pedido", "O estoque será devolvido. Deseja continuar?", [
            { text: "Voltar", style: "cancel" },
            {
                text: "Cancelar pedido",
                style: "destructive",
                onPress: () => {
                    const client = clients.find((c) => c.clientId === clientId);
                    const order  = client?.orders?.find((o) => o.orderId === orderId);
                    if (order?.productId && order?.quantity) {
                        const prod = userProducts.find((p) => p.productId === order.productId);
                        if (prod) updateProductQuantity(prod.productId, prod.quantity + order.quantity);
                    }
                    updateOrderStatus(orderId, "cancelled");
                    closeEditOrderModal();
                    loadData();
                },
            },
        ]);
    };

    const handleDeleteOrder = (clientId, orderId) => {
        Alert.alert("Excluir pedido", "Esta ação é irreversível. O estoque será devolvido.", [
            { text: "Voltar", style: "cancel" },
            {
                text: "Excluir definitivamente",
                style: "destructive",
                onPress: () => {
                    const client = clients.find((c) => c.clientId === clientId);
                    const order  = client?.orders?.find((o) => o.orderId === orderId);
                    if (order?.productId && order?.quantity) {
                        const prod = userProducts.find((p) => p.productId === order.productId);
                        if (prod) updateProductQuantity(prod.productId, prod.quantity + order.quantity);
                    }
                    deleteOrder(orderId);
                    closeEditOrderModal();
                    loadData();
                },
            },
        ]);
    };

    const handleRecoverOrder = (clientId, orderId) => {
        Alert.alert(
            "Recuperar pedido",
            "O pedido voltará como ativo e o estoque será deduzido novamente.",
            [
                { text: "Voltar", style: "cancel" },
                {
                    text: "Recuperar",
                    onPress: () => {
                        const client = clients.find((c) => c.clientId === clientId);
                        const order  = client?.orders?.find((o) => o.orderId === orderId);
                        if (order?.productId && order?.quantity) {
                            const prod = userProducts.find((p) => p.productId === order.productId);
                            if (prod) {
                                if (prod.quantity < order.quantity) {
                                    Alert.alert(
                                        "Estoque insuficiente",
                                        `Disponível: ${prod.quantity} un. de "${prod.name}". Ajuste o estoque antes de recuperar.`
                                    );
                                    return;
                                }
                                updateProductQuantity(prod.productId, prod.quantity - order.quantity);
                            }
                        }
                        updateOrderStatus(orderId, "active");
                        loadData();
                    },
                },
            ]
        );
    };

    const handleCompleteOrder = (clientId, orderId) => {
        Alert.alert(
            "Finalizar pedido",
            "Marcar este pedido como finalizado? Ele será movido para o histórico de concluídos.",
            [
                { text: "Voltar", style: "cancel" },
                {
                    text: "Finalizar",
                    onPress: () => { updateOrderStatus(orderId, "completed"); loadData(); },
                },
            ]
        );
    };

    const handleDeleteCancelledOrder = (clientId, orderId) => {
        Alert.alert(
            "Excluir do histórico",
            "Remover este pedido cancelado permanentemente?",
            [
                { text: "Voltar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => { deleteOrder(orderId); loadData(); },
                },
            ]
        );
    };

    // ── Parcelas ──────────────────────────────────────────────────────────────

    const handlePayInstallment = (clientId, orderId, installmentId) => {
        Alert.alert(
            "Confirmar pagamento",
            "Marcar esta parcela como paga?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: () => {
                        setInstallmentPaid(installmentId, true);
                        const client = clients.find((c) => c.clientId === clientId);
                        const order  = client?.orders?.find((o) => o.orderId === orderId);
                        if (order) {
                            const allPaid = order.installments.every(
                                (i) => i.installmentId === installmentId ? true : i.paid
                            );
                            if (allPaid && order.installments.length > 0) {
                                Alert.alert(
                                    "Pedido concluído!",
                                    "Todas as parcelas foram pagas. Deseja marcar este pedido como finalizado?",
                                    [
                                        { text: "Deixar ativo", style: "cancel", onPress: () => loadData() },
                                        {
                                            text: "Finalizar pedido",
                                            onPress: () => { updateOrderStatus(orderId, "completed"); loadData(); },
                                        },
                                    ]
                                );
                            } else {
                                loadData();
                            }
                        } else {
                            loadData();
                        }
                    },
                },
            ]
        );
    };

    const handleUnpayInstallment = (clientId, orderId, installmentId) => {
        Alert.alert("Cancelar pagamento", "Marcar esta parcela como não paga?", [
            { text: "Voltar", style: "cancel" },
            {
                text: "Confirmar",
                style: "destructive",
                onPress: () => { setInstallmentPaid(installmentId, false); loadData(); },
            },
        ]);
    };

    const openAddInstallment = (orderId) => {
        setSelectedOrderId(orderId);
        setAddInstallmentValue("");
        setAddInstallmentModal(true);
    };

    const handleAddInstallment = (clientId) => {
        const value = parseCurrency(addInstallmentValue);
        if (!value || value <= 0) { Alert.alert("Valor inválido", "Informe um valor válido para a parcela."); return; }
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
        loadData();
    };

    // ── Expand ────────────────────────────────────────────────────────────────

    const toggleClient = (id) => setExpandedClientId((p) => (p === id ? null : id));
    const toggleOrder  = (id) => setExpandedOrderId((p)  => (p === id ? null : id));

    // ── Busca ─────────────────────────────────────────────────────────────────

    const toggleSearch = () =>
        setSearchVisible((v) => { if (v) setSearchQuery(""); return !v; });

    const filteredClients = (() => {
        let base = searchQuery.trim()
            ? clients.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (c.phone || "").includes(searchQuery)
            )
            : clients;

        return base.map((c) => ({
            ...c,
            orders: (c.orders || []).filter((o) =>
                showCompleted ? o.status === "completed" : o.status !== "completed"
            ),
        })).filter((c) => (showCompleted ? c.orders.length > 0 : true));
    })();

    // ── Derivados ─────────────────────────────────────────────────────────────

    const totalClients      = clients.length;
    const totalActiveOrders = clients.reduce(
        (acc, c) => acc + (c.orders || []).filter((o) => o.status === "active").length, 0
    );
    const totalPending = clients.reduce(
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
    const totalCompleted = clients.reduce(
        (acc, c) => acc + (c.orders || []).filter((o) => o.status === "completed").length, 0
    );

    return {
        clients: filteredClients,
        allClients: clients,
        userProducts,
        expandedClientId,
        expandedOrderId,
        totalClients,
        totalActiveOrders,
        totalPending,
        totalCompleted,
        searchQuery, setSearchQuery,
        searchVisible, toggleSearch,
        showCompleted, setShowCompleted,
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
    };
}