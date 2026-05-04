import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseCurrency } from "../shared/helpers";
import {
  initDatabase,
  getClients,
  upsertClient,
  deleteClient,
  getProducts,
  upsertProduct,
  updateProductQuantity,
  insertOrder,
  updateOrderStatus,
  updateOrderTotalValue,
  setInstallmentPaid,
  insertInstallment,
} from "../shared/database";

const EMPTY_CLIENT = { name: "", email: "", phone: "" };
const EMPTY_ORDER_ITEM = { productId: "", quantity: "", installments: "" };

export function useClients() {
  const [clients, setClients] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Modal de cliente
  const [clientModal, setClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT);

  // Modal de pedido
  const [orderModal, setOrderModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [orderItems, setOrderItems] = useState([{ ...EMPTY_ORDER_ITEM }]);
  const [pickerOpenIndex, setPickerOpenIndex] = useState(null);

  // Modal de parcela
  const [addInstallmentModal, setAddInstallmentModal] = useState(false);
  const [addInstallmentValue, setAddInstallmentValue] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Busca
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  // ── Carregar ────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      initDatabase();
      loadData();
    }, [])
  );

  const loadData = async () => {
    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const clientsList = getClients(user.id);
    setClients(clientsList.sort((a, b) => b.createdAt - a.createdAt));

    const productsList = getProducts(user.id);
    setUserProducts(productsList);
  };

  // ── CRUD Clientes ───────────────────────────────────────────────────────────

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

    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const now = Date.now();
    const client = editingClient
      ? {
          ...editingClient,
          name: clientForm.name.trim(),
          email: clientForm.email.trim(),
          phone: clientForm.phone,
        }
      : {
          clientId: `cli_${now}_${Math.random().toString(36).slice(2)}`,
          userId: user.id,
          name: clientForm.name.trim(),
          email: clientForm.email.trim(),
          phone: clientForm.phone,
          createdAt: now,
        };

    upsertClient(client);
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
          onPress: () => {
            deleteClient(client.clientId);
            loadData();
          },
        },
      ]
    );
  };

  // ── Pedidos ────────────────────────────────────────────────────────────────

  const openCreateOrder = (clientId) => {
    setSelectedClientId(clientId);
    setOrderItems([{ ...EMPTY_ORDER_ITEM }]);
    setPickerOpenIndex(null);
    setExpandedOrderId(null);
    setOrderModal(true);
  };

  const closeOrderModal = () => {
    setOrderModal(false);
    setSelectedClientId(null);
    setOrderItems([{ ...EMPTY_ORDER_ITEM }]);
    setPickerOpenIndex(null);
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [...prev, { ...EMPTY_ORDER_ITEM }]);
    setPickerOpenIndex(null);
  };

  const removeOrderItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    setPickerOpenIndex(null);
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveOrder = async () => {
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const qty = parseInt(item.quantity, 10);
      const inst = parseInt(item.installments, 10);

      if (!item.productId) {
        Alert.alert("Produto obrigatório", `Selecione um produto no item ${i + 1}.`);
        return;
      }
      if (!qty || qty <= 0) {
        Alert.alert("Campo inválido", `Informe uma quantidade válida no item ${i + 1}.`);
        return;
      }
      if (!inst || inst <= 0) {
        Alert.alert("Campo inválido", `Informe o número de parcelas no item ${i + 1}.`);
        return;
      }
    }

    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const products = getProducts(user.id);

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const qty = parseInt(item.quantity, 10);
      const product = products.find((p) => p.productId === item.productId);
      if (!product) {
        Alert.alert("Erro", `Produto do item ${i + 1} não encontrado.`);
        return;
      }
      if (product.quantity < qty) {
        Alert.alert(
          "Estoque insuficiente",
          `Item ${i + 1}: disponível ${product.quantity} un. de "${product.name}".`
        );
        return;
      }
    }

    const now = Date.now();

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const qty = parseInt(item.quantity, 10);
      const inst = parseInt(item.installments, 10);
      const product = products.find((p) => p.productId === item.productId);
      const total = product.price * qty;
      const installmentValue = total / inst;

      // Deduzir estoque
      updateProductQuantity(product.productId, product.quantity - qty);

      const order = {
        orderId: `ord_${now}_${i}_${Math.random().toString(36).slice(2)}`,
        clientId: selectedClientId,
        userId: user.id,
        totalValue: total,
        quantity: qty,
        status: "active",
        productRef: product.name,
        productId: product.productId,
        createdAt: now,
        installments: Array.from({ length: inst }, (_, j) => ({
          installmentId: `inst_${now}_${i}_${j}`,
          index: j + 1,
          value: installmentValue,
        })),
      };

      insertOrder(order);
    }

    closeOrderModal();
    loadData();
  };

  // ── Parcelas ────────────────────────────────────────────────────────────────

  const handlePayInstallment = (clientId, orderId, installmentId) => {
    setInstallmentPaid(installmentId, true);
    loadData();
  };

  const handleUnpayInstallment = (clientId, orderId, installmentId) => {
    Alert.alert(
      "Cancelar pagamento",
      "Deseja marcar esta parcela como não paga?",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => {
            setInstallmentPaid(installmentId, false);
            loadData();
          },
        },
      ]
    );
  };

  const openAddInstallment = (orderId) => {
    setSelectedOrderId(orderId);
    setAddInstallmentValue("");
    setAddInstallmentModal(true);
  };

  const handleAddInstallment = (clientId) => {
    const value = parseCurrency(addInstallmentValue);
    if (!value || value <= 0) {
      Alert.alert("Valor inválido", "Informe um valor válido para a parcela.");
      return;
    }

    // Buscar pedido para saber o índice atual
    const client = clients.find((c) => c.clientId === clientId);
    const order = client?.orders?.find((o) => o.orderId === selectedOrderId);
    if (!order) return;

    const newIndex = order.installments.length + 1;

    insertInstallment({
      installmentId: `inst_${Date.now()}`,
      orderId: selectedOrderId,
      index: newIndex,
      value,
    });

    updateOrderTotalValue(selectedOrderId, order.totalValue + value);

    setAddInstallmentModal(false);
    setSelectedOrderId(null);
    loadData();
  };

  const handleCancelOrder = (clientId, orderId) => {
    Alert.alert("Cancelar pedido", "Tem certeza? O estoque será devolvido.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar pedido",
        style: "destructive",
        onPress: async () => {
          const client = clients.find((c) => c.clientId === clientId);
          const order = client?.orders?.find((o) => o.orderId === orderId);

          if (order && order.productId && order.quantity) {
            const loggedUser = await AsyncStorage.getItem("userData");
            if (loggedUser) {
              const user = JSON.parse(loggedUser);
              const products = getProducts(user.id);
              const product = products.find((p) => p.productId === order.productId);
              if (product) {
                updateProductQuantity(product.productId, product.quantity + order.quantity);
              }
            }
          }

          updateOrderStatus(orderId, "cancelled");
          loadData();
        },
      },
    ]);
  };

  // ── Expand ──────────────────────────────────────────────────────────────────

  const toggleClient = (id) => setExpandedClientId((prev) => (prev === id ? null : id));
  const toggleOrder = (id) => setExpandedOrderId((prev) => (prev === id ? null : id));

  // ── Busca ────────────────────────────────────────────────────────────────────

  const toggleSearch = () => {
    setSearchVisible((v) => {
      if (v) setSearchQuery("");
      return !v;
    });
  };

  const filteredClients = searchQuery.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.phone || "").includes(searchQuery)
      )
    : clients;

  // ── Derivados ───────────────────────────────────────────────────────────────

  const totalClients = clients.length;
  const totalActiveOrders = clients.reduce(
    (acc, c) => acc + (c.orders || []).filter((o) => o.status === "active").length,
    0
  );
  const totalPending = clients.reduce(
    (acc, c) =>
      acc +
      (c.orders || [])
        .filter((o) => o.status === "active")
        .reduce(
          (s, o) =>
            s + o.installments.filter((i) => !i.paid).reduce((a, i) => a + i.value, 0),
          0
        ),
    0
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
    searchQuery,
    setSearchQuery,
    searchVisible,
    toggleSearch,
    // modal cliente
    clientModal,
    editingClient,
    clientForm,
    setClientForm,
    openCreateClient,
    openEditClient,
    closeClientModal,
    handleSaveClient,
    handleDeleteClient,
    // modal pedido
    orderModal,
    orderItems,
    pickerOpenIndex,
    setPickerOpenIndex,
    openCreateOrder,
    closeOrderModal,
    addOrderItem,
    removeOrderItem,
    updateOrderItem,
    handleSaveOrder,
    // modal parcela
    addInstallmentModal,
    addInstallmentValue,
    setAddInstallmentValue,
    selectedOrderId,
    openAddInstallment,
    handleAddInstallment,
    setAddInstallmentModal,
    // ações
    handlePayInstallment,
    handleUnpayInstallment,
    handleCancelOrder,
    toggleClient,
    toggleOrder,
  };
}
