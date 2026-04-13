import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseCurrency } from "../shared/helpers";

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

  // ── Carregar ────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  const loadClients = async () => {
    const loggedUser = await AsyncStorage.getItem("userData");
    if (!loggedUser) return;
    const user = JSON.parse(loggedUser);

    const stored = await AsyncStorage.getItem("clients");
    const list = stored ? JSON.parse(stored) : [];
    setClients(
      list.filter((c) => c.userId === user.id).sort((a, b) => b.createdAt - a.createdAt)
    );

    const storedProducts = await AsyncStorage.getItem("products");
    const products = storedProducts ? JSON.parse(storedProducts) : [];
    setUserProducts(products.filter((p) => p.userId === user.id));
  };

  const saveClients = async (list) => {
    await AsyncStorage.setItem("clients", JSON.stringify(list));
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

    const stored = await AsyncStorage.getItem("clients");
    let list = stored ? JSON.parse(stored) : [];

    if (editingClient) {
      list = list.map((c) =>
        c.clientId === editingClient.clientId
          ? { ...c, name: clientForm.name.trim(), email: clientForm.email.trim(), phone: clientForm.phone }
          : c
      );
    } else {
      list.push({
        clientId: `cli_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: user.id,
        name: clientForm.name.trim(),
        email: clientForm.email.trim(),
        phone: clientForm.phone,
        orders: [],
        createdAt: Date.now(),
      });
    }

    await saveClients(list);
    closeClientModal();
    loadClients();
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
          onPress: async () => {
            const stored = await AsyncStorage.getItem("clients");
            let list = stored ? JSON.parse(stored) : [];
            list = list.filter((c) => c.clientId !== client.clientId);
            await saveClients(list);
            loadClients();
          },
        },
      ]
    );
  };

  // ── Pedidos (múltiplos itens) ───────────────────────────────────────────────

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

    const storedProducts = await AsyncStorage.getItem("products");
    let products = storedProducts ? JSON.parse(storedProducts) : [];

    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const qty = parseInt(item.quantity, 10);
      const product = products.find((p) => p.productId === item.productId);
      if (!product) {
        Alert.alert("Erro", `Produto do item ${i + 1} não encontrado.`);
        return;
      }
      if (product.quantity < qty) {
        Alert.alert("Estoque insuficiente", `Item ${i + 1}: disponível ${product.quantity} un. de "${product.name}".`);
        return;
      }
    }

    const now = Date.now();
    const newOrders = orderItems.map((item, i) => {
      const qty = parseInt(item.quantity, 10);
      const inst = parseInt(item.installments, 10);
      const product = products.find((p) => p.productId === item.productId);
      const total = product.price * qty;
      const installmentValue = total / inst;

      products = products.map((p) =>
        p.productId === item.productId ? { ...p, quantity: p.quantity - qty } : p
      );

      return {
        orderId: `ord_${now}_${i}_${Math.random().toString(36).slice(2)}`,
        clientId: selectedClientId,
        totalValue: total,
        quantity: qty,
        installments: Array.from({ length: inst }, (_, j) => ({
          installmentId: `inst_${now}_${i}_${j}`,
          index: j + 1,
          value: installmentValue,
          paid: false,
          paidAt: null,
        })),
        status: "active",
        productRef: product.name,
        productId: product.productId,
        createdAt: now,
      };
    });

    await AsyncStorage.setItem("products", JSON.stringify(products));

    const stored = await AsyncStorage.getItem("clients");
    let list = stored ? JSON.parse(stored) : [];
    list = list.map((c) =>
      c.clientId === selectedClientId
        ? { ...c, orders: [...(c.orders || []), ...newOrders] }
        : c
    );

    await saveClients(list);
    closeOrderModal();
    loadClients();
  };

  // ── Parcelas ────────────────────────────────────────────────────────────────

  const handlePayInstallment = async (clientId, orderId, installmentId) => {
    const stored = await AsyncStorage.getItem("clients");
    let list = stored ? JSON.parse(stored) : [];
    list = list.map((c) => {
      if (c.clientId !== clientId) return c;
      return {
        ...c,
        orders: c.orders.map((o) => {
          if (o.orderId !== orderId) return o;
          return {
            ...o,
            installments: o.installments.map((inst) =>
              inst.installmentId === installmentId
                ? { ...inst, paid: true, paidAt: Date.now() }
                : inst
            ),
          };
        }),
      };
    });
    await saveClients(list);
    loadClients();
  };

  const openAddInstallment = (orderId) => {
    setSelectedOrderId(orderId);
    setAddInstallmentValue("");
    setAddInstallmentModal(true);
  };

  const handleAddInstallment = async (clientId) => {
    const value = parseCurrency(addInstallmentValue);
    if (!value || value <= 0) {
      Alert.alert("Valor inválido", "Informe um valor válido para a parcela.");
      return;
    }

    const stored = await AsyncStorage.getItem("clients");
    let list = stored ? JSON.parse(stored) : [];
    list = list.map((c) => {
      if (c.clientId !== clientId) return c;
      return {
        ...c,
        orders: c.orders.map((o) => {
          if (o.orderId !== selectedOrderId) return o;
          const newInst = {
            installmentId: `inst_${Date.now()}`,
            index: o.installments.length + 1,
            value,
            paid: false,
            paidAt: null,
          };
          return { ...o, totalValue: o.totalValue + value, installments: [...o.installments, newInst] };
        }),
      };
    });

    await saveClients(list);
    setAddInstallmentModal(false);
    setSelectedOrderId(null);
    loadClients();
  };

  const handleCancelOrder = (clientId, orderId) => {
    Alert.alert("Cancelar pedido", "Tem certeza? O estoque será devolvido.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Cancelar pedido",
        style: "destructive",
        onPress: async () => {
          const stored = await AsyncStorage.getItem("clients");
          let list = stored ? JSON.parse(stored) : [];

          let cancelledProductId = null;
          let cancelledQty = 0;

          list = list.map((c) => {
            if (c.clientId !== clientId) return c;
            return {
              ...c,
              orders: c.orders.map((o) => {
                if (o.orderId !== orderId) return o;
                cancelledProductId = o.productId;
                cancelledQty = o.quantity || 1;
                return { ...o, status: "cancelled" };
              }),
            };
          });

          if (cancelledProductId) {
            const storedProducts = await AsyncStorage.getItem("products");
            let products = storedProducts ? JSON.parse(storedProducts) : [];
            products = products.map((p) =>
              p.productId === cancelledProductId ? { ...p, quantity: p.quantity + cancelledQty } : p
            );
            await AsyncStorage.setItem("products", JSON.stringify(products));
          }

          await saveClients(list);
          loadClients();
        },
      },
    ]);
  };

  // ── Expand ──────────────────────────────────────────────────────────────────

  const toggleClient = (id) => setExpandedClientId((prev) => (prev === id ? null : id));
  const toggleOrder = (id) => setExpandedOrderId((prev) => (prev === id ? null : id));

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
        .reduce((s, o) => s + o.installments.filter((i) => !i.paid).reduce((a, i) => a + i.value, 0), 0),
    0
  );

  return {
    // dados
    clients,
    userProducts,
    expandedClientId,
    expandedOrderId,
    totalClients,
    totalActiveOrders,
    totalPending,
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
    handleCancelOrder,
    toggleClient,
    toggleOrder,
  };
}
