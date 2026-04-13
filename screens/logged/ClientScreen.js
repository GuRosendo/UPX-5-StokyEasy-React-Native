import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  ScrollView,
  FlatList,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value) => {
  const numeric = value.replace(/\D/g, "");
  if (!numeric) return "";
  return (parseInt(numeric, 10) / 100).toFixed(2).replace(".", ",");
};

const parseCurrency = (value) => parseFloat(value.replace(",", ".")) || 0;

const formatPhone = (value) => {
  const n = value.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  return value;
};

const toCurrencyDisplay = (num) =>
  `R$ ${(num || 0).toFixed(2).replace(".", ",")}`;

const EMPTY_CLIENT = { name: "", email: "", phone: "" };

// Um item de pedido: produto selecionado + quantidade + parcelas
const EMPTY_ORDER_ITEM = { productId: "", quantity: "", installments: "" };

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClientsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  const [clients, setClients] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Modais
  const [clientModal, setClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT);

  // Modal de pedido — agora suporta múltiplos itens
  const [orderModal, setOrderModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [orderItems, setOrderItems] = useState([{ ...EMPTY_ORDER_ITEM }]);
  // Qual item está com o picker de produto aberto
  const [pickerOpenIndex, setPickerOpenIndex] = useState(null);

  const [addInstallmentModal, setAddInstallmentModal] = useState(false);
  const [addInstallmentValue, setAddInstallmentValue] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // ── Carrega clientes ──────────────────────────────────────────────────────

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
    const userClients = list
      .filter((c) => c.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt);
    setClients(userClients);

    const storedProducts = await AsyncStorage.getItem("products");
    const products = storedProducts ? JSON.parse(storedProducts) : [];
    setUserProducts(products.filter((p) => p.userId === user.id));
  };

  const saveClients = async (list) => {
    await AsyncStorage.setItem("clients", JSON.stringify(list));
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

  // ── Pedidos (múltiplos itens) ─────────────────────────────────────────────

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
    // Valida todos os itens
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

    // Verifica estoque de todos os itens antes de confirmar
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

    // Gera um pedido por item e baixa o estoque
    const now = Date.now();
    const newOrders = orderItems.map((item, i) => {
      const qty = parseInt(item.quantity, 10);
      const inst = parseInt(item.installments, 10);
      const product = products.find((p) => p.productId === item.productId);
      const total = product.price * qty;
      const installmentValue = total / inst;

      // Baixa estoque
      products = products.map((p) =>
        p.productId === item.productId
          ? { ...p, quantity: p.quantity - qty }
          : p
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

  // ── Parcelas ──────────────────────────────────────────────────────────────

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
          return {
            ...o,
            totalValue: o.totalValue + value,
            installments: [...o.installments, newInst],
          };
        }),
      };
    });

    await saveClients(list);
    setAddInstallmentModal(false);
    setSelectedOrderId(null);
    loadClients();
  };

  const handleCancelOrder = (clientId, orderId) => {
    Alert.alert(
      "Cancelar pedido",
      "Tem certeza? O estoque será devolvido.",
      [
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
                p.productId === cancelledProductId
                  ? { ...p, quantity: p.quantity + cancelledQty }
                  : p
              );
              await AsyncStorage.setItem("products", JSON.stringify(products));
            }

            await saveClients(list);
            loadClients();
          },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const toggleClient = (id) =>
    setExpandedClientId((prev) => (prev === id ? null : id));

  const toggleOrder = (id) =>
    setExpandedOrderId((prev) => (prev === id ? null : id));

  const totalClients = clients.length;
  const totalActiveOrders = clients.reduce(
    (acc, c) => acc + (c.orders || []).filter((o) => o.status === "active").length,
    0
  );
  const totalPending = clients.reduce((acc, c) => {
    return (
      acc +
      (c.orders || [])
        .filter((o) => o.status === "active")
        .reduce(
          (s, o) =>
            s + o.installments.filter((i) => !i.paid).reduce((a, i) => a + i.value, 0),
          0
        )
    );
  }, 0);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
          Clientes
        </Text>

        {/* Resumo */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="users" size={18} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalClients}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Clientes</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="cart-shopping" size={18} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalActiveOrders}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Pedidos ativos</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="clock" size={18} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {toCurrencyDisplay(totalPending)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>A receber</Text>
          </View>
        </View>

        {/* Lista */}
        {clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="user-slash" size={48} color={colors.mediumRed} style={{ opacity: 0.4 }} />
            <Text style={[styles.empty, { color: colors.text }]}>
              Nenhum cliente cadastrado ainda.
            </Text>
          </View>
        ) : (
          clients.map((client) => {
            const isClientExpanded = expandedClientId === client.clientId;
            const activeOrders = (client.orders || []).filter((o) => o.status === "active");
            const cancelledOrders = (client.orders || []).filter((o) => o.status === "cancelled");

            return (
              <View key={client.clientId}>
                <TouchableOpacity activeOpacity={0.85} onPress={() => toggleClient(client.clientId)}>
                  <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
                    <Card.Title
                      title={client.name}
                      subtitle={`${activeOrders.length} pedido(s) ativo(s)`}
                      titleStyle={{ fontSize: 17, fontWeight: "600", color: colors.text }}
                      subtitleStyle={{ opacity: 0.6, color: colors.text }}
                      left={() => (
                        <View style={[styles.iconContainer, { backgroundColor: colors.mediumRedOpaque }]}>
                          <FontAwesome6 name="user" size={18} color={colors.mediumRed} />
                        </View>
                      )}
                      right={() => (
                        <FontAwesome6
                          name={isClientExpanded ? "chevron-up" : "chevron-down"}
                          size={14}
                          color={colors.text}
                          style={{ marginRight: 16, opacity: 0.5 }}
                        />
                      )}
                    />

                    {isClientExpanded && (
                      <Card.Content style={styles.expandedContent}>
                        {client.email ? (
                          <Text style={[styles.infoText, { color: colors.text }]}>
                            <FontAwesome6 name="envelope" size={13} color={colors.mediumRed} /> {client.email}
                          </Text>
                        ) : null}
                        {client.phone ? (
                          <Text style={[styles.infoText, { color: colors.text }]}>
                            <FontAwesome6 name="phone" size={13} color={colors.mediumRed} /> {client.phone}
                          </Text>
                        ) : null}

                        <View style={styles.actionRow}>
                          <Button
                            mode="contained"
                            icon="plus"
                            style={[styles.actionButton, { backgroundColor: colors.mediumRed }]}
                            labelStyle={{ color: "#fff", fontSize: 12 }}
                            onPress={() => openCreateOrder(client.clientId)}
                          >
                            Novo pedido
                          </Button>
                          <Button
                            mode="outlined"
                            icon="pencil"
                            style={[styles.actionButton, { borderColor: colors.mediumRed }]}
                            labelStyle={{ color: colors.mediumRed, fontSize: 12 }}
                            onPress={() => openEditClient(client)}
                          >
                            Editar
                          </Button>
                          <Button
                            mode="outlined"
                            icon="trash-can-outline"
                            style={[styles.actionButton, { borderColor: "#c0392b" }]}
                            labelStyle={{ color: "#c0392b", fontSize: 12 }}
                            onPress={() => handleDeleteClient(client)}
                          >
                            Excluir
                          </Button>
                        </View>

                        {activeOrders.length > 0 && (
                          <Text style={[styles.sectionLabel, { color: colors.text }]}>
                            Pedidos ativos
                          </Text>
                        )}
                        {activeOrders.map((order) => {
                          const isOrderExpanded = expandedOrderId === order.orderId;
                          const paidCount = order.installments.filter((i) => i.paid).length;
                          const totalCount = order.installments.length;
                          const pending = order.installments
                            .filter((i) => !i.paid)
                            .reduce((a, i) => a + i.value, 0);

                          return (
                            <View key={order.orderId} style={[styles.orderCard, { backgroundColor: colors.background }]}>
                              <TouchableOpacity onPress={() => toggleOrder(order.orderId)}>
                                <View style={styles.orderHeader}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={[styles.orderTitle, { color: colors.text }]}>
                                      {order.productRef || "Pedido"} — {toCurrencyDisplay(order.totalValue)}
                                    </Text>
                                    <Text style={[styles.orderSubtitle, { color: colors.text }]}>
                                      {paidCount}/{totalCount} parcelas quitadas • Pendente: {toCurrencyDisplay(pending)}
                                    </Text>
                                  </View>
                                  <FontAwesome6
                                    name={isOrderExpanded ? "chevron-up" : "chevron-down"}
                                    size={12}
                                    color={colors.text}
                                    style={{ opacity: 0.5 }}
                                  />
                                </View>
                              </TouchableOpacity>

                              {isOrderExpanded && (
                                <View style={styles.installmentList}>
                                  {order.installments.map((inst) => (
                                    <View key={inst.installmentId} style={styles.installmentRow}>
                                      <Text style={[styles.installmentText, { color: colors.text }]}>
                                        {inst.index}ª parcela — {toCurrencyDisplay(inst.value)}
                                      </Text>
                                      {inst.paid ? (
                                        <View style={styles.paidBadge}>
                                          <FontAwesome6 name="check" size={11} color="#27ae60" />
                                          <Text style={styles.paidText}>Pago</Text>
                                        </View>
                                      ) : (
                                        <TouchableOpacity
                                          style={[styles.payButton, { borderColor: colors.mediumRed }]}
                                          onPress={() =>
                                            handlePayInstallment(client.clientId, order.orderId, inst.installmentId)
                                          }
                                        >
                                          <Text style={[styles.payButtonText, { color: colors.mediumRed }]}>
                                            Quitar
                                          </Text>
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  ))}

                                  <View style={[styles.actionRow, { marginTop: 10 }]}>
                                    <Button
                                      mode="outlined"
                                      icon="plus"
                                      style={[styles.actionButton, { borderColor: colors.mediumRed }]}
                                      labelStyle={{ color: colors.mediumRed, fontSize: 11 }}
                                      onPress={() => openAddInstallment(order.orderId)}
                                    >
                                      + Parcela
                                    </Button>
                                    <Button
                                      mode="outlined"
                                      icon="close"
                                      style={[styles.actionButton, { borderColor: "#c0392b" }]}
                                      labelStyle={{ color: "#c0392b", fontSize: 11 }}
                                      onPress={() => handleCancelOrder(client.clientId, order.orderId)}
                                    >
                                      Cancelar
                                    </Button>
                                  </View>
                                </View>
                              )}
                            </View>
                          );
                        })}

                        {cancelledOrders.length > 0 && (
                          <>
                            <Text style={[styles.sectionLabel, { color: colors.text, opacity: 0.5 }]}>
                              Cancelados
                            </Text>
                            {cancelledOrders.map((order) => (
                              <View key={order.orderId} style={[styles.orderCard, { backgroundColor: colors.background, opacity: 0.5 }]}>
                                <Text style={[styles.orderTitle, { color: colors.text }]}>
                                  {order.productRef || "Pedido"} — {toCurrencyDisplay(order.totalValue)}
                                </Text>
                                <Text style={[styles.orderSubtitle, { color: colors.text }]}>
                                  Cancelado ✕
                                </Text>
                              </View>
                            ))}
                          </>
                        )}
                      </Card.Content>
                    )}
                  </Card>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.mediumRed }]}
        onPress={openCreateClient}
        activeOpacity={0.85}
      >
        <FontAwesome6 name="user-plus" size={20} color="#fff" />
      </TouchableOpacity>

      {/* ── Modal Cliente ─────────────────────────────────────────────────── */}
      {/* FIX: overlay separado do KeyboardAvoidingView para evitar congelamento no Android */}
      <Modal visible={clientModal} transparent animationType="slide" onRequestClose={closeClientModal}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingModal}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingClient ? "Editar Cliente" : "Novo Cliente"}
                </Text>
                <TouchableOpacity onPress={closeClientModal}>
                  <FontAwesome6 name="xmark" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                placeholder="Ex: João Silva"
                placeholderTextColor={colors.text + "66"}
                value={clientForm.name}
                onChangeText={(v) => setClientForm({ ...clientForm, name: v })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                placeholder="cliente@email.com"
                placeholderTextColor={colors.text + "66"}
                keyboardType="email-address"
                autoCapitalize="none"
                value={clientForm.email}
                onChangeText={(v) => setClientForm({ ...clientForm, email: v })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.text + "66"}
                keyboardType="phone-pad"
                value={clientForm.phone}
                onChangeText={(v) => setClientForm({ ...clientForm, phone: formatPhone(v) })}
              />

              <View style={styles.modalButtons}>
                <Button mode="outlined" onPress={closeClientModal} style={[styles.modalBtn, { borderColor: colors.mediumRed }]} labelStyle={{ color: colors.mediumRed }}>
                  Cancelar
                </Button>
                <Button mode="contained" onPress={handleSaveClient} style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]} labelStyle={{ color: "#fff" }}>
                  {editingClient ? "Salvar" : "Cadastrar"}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Modal Pedido (múltiplos itens) ────────────────────────────────── */}
      {/* FIX: mesmo padrão — overlay separado do KeyboardAvoidingView */}
      <Modal
        visible={orderModal}
        transparent
        animationType="slide"
        onRequestClose={closeOrderModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingModal}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Pedido</Text>
                <TouchableOpacity onPress={closeOrderModal}>
                  <FontAwesome6 name="xmark" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* ScrollView interno para suportar múltiplos itens */}
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {orderItems.map((item, index) => {
                  const availableProducts = userProducts.filter((p) => p.quantity > 0);
                  const selectedProduct = userProducts.find((p) => p.productId === item.productId);
                  const qty = parseInt(item.quantity, 10) || 0;
                  const inst = parseInt(item.installments, 10) || 1;
                  const total = selectedProduct ? selectedProduct.price * qty : 0;
                  const overStock = selectedProduct && qty > selectedProduct.quantity;
                  const isPickerOpen = pickerOpenIndex === index;

                  return (
                    <View
                      key={index}
                      style={[styles.orderItemBlock, { borderColor: colors.mediumRed + "40", backgroundColor: colors.background }]}
                    >
                      {/* Cabeçalho do item */}
                      <View style={styles.orderItemHeader}>
                        <Text style={[styles.orderItemTitle, { color: colors.mediumRed }]}>
                          Item {index + 1}
                        </Text>
                        {orderItems.length > 1 && (
                          <TouchableOpacity onPress={() => removeOrderItem(index)}>
                            <FontAwesome6 name="trash" size={15} color="#c0392b" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Seleção de produto */}
                      <Text style={[styles.label, { color: colors.text }]}>Produto *</Text>
                      <TouchableOpacity
                        style={[styles.productSelector, { borderColor: colors.mediumRed, backgroundColor: colors.card }]}
                        onPress={() => setPickerOpenIndex(isPickerOpen ? null : index)}
                      >
                        <Text style={{ color: selectedProduct ? colors.text : colors.text + "66", flex: 1 }}>
                          {selectedProduct ? selectedProduct.name : "Selecione um produto..."}
                        </Text>
                        <FontAwesome6
                          name={isPickerOpen ? "chevron-up" : "chevron-down"}
                          size={12}
                          color={colors.text}
                        />
                      </TouchableOpacity>

                      {isPickerOpen && (
                        availableProducts.length === 0 ? (
                          <View style={[styles.productPicker, { borderColor: colors.mediumRed, justifyContent: "center" }]}>
                            <Text style={[styles.noStockText, { color: colors.text }]}>
                              ⚠️ Nenhum produto com estoque disponível.
                            </Text>
                          </View>
                        ) : (
                          <FlatList
                            data={availableProducts}
                            keyExtractor={(p) => p.productId}
                            style={[styles.productPicker, { borderColor: colors.mediumRed }]}
                            scrollEnabled
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item: p }) => {
                              const selected = item.productId === p.productId;
                              return (
                                <TouchableOpacity
                                  style={[
                                    styles.productOption,
                                    { borderColor: selected ? colors.mediumRed : colors.text + "22" },
                                    selected && { backgroundColor: colors.mediumRed + "22" },
                                  ]}
                                  onPress={() => {
                                    updateOrderItem(index, "productId", p.productId);
                                    setPickerOpenIndex(null);
                                  }}
                                >
                                  <View style={{ flex: 1 }}>
                                    <Text style={[styles.productOptionName, { color: colors.text }]}>{p.name}</Text>
                                    <Text style={[styles.productOptionSub, { color: colors.text }]}>
                                      Estoque: {p.quantity} • {toCurrencyDisplay(p.price)} cada
                                    </Text>
                                  </View>
                                  {selected && (
                                    <FontAwesome6 name="circle-check" size={18} color={colors.mediumRed} />
                                  )}
                                </TouchableOpacity>
                              );
                            }}
                          />
                        )
                      )}

                      {/* Quantidade e parcelas */}
                      <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={[styles.label, { color: colors.text }]}>Quantidade *</Text>
                          <TextInput
                            style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.card }]}
                            placeholder="1"
                            placeholderTextColor={colors.text + "66"}
                            keyboardType="numeric"
                            value={item.quantity}
                            onChangeText={(v) => updateOrderItem(index, "quantity", v.replace(/\D/g, ""))}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={[styles.label, { color: colors.text }]}>Parcelas *</Text>
                          <TextInput
                            style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.card }]}
                            placeholder="1"
                            placeholderTextColor={colors.text + "66"}
                            keyboardType="numeric"
                            value={item.installments}
                            onChangeText={(v) => updateOrderItem(index, "installments", v.replace(/\D/g, ""))}
                          />
                        </View>
                      </View>

                      {/* Preview */}
                      {selectedProduct && item.quantity && item.installments ? (
                        <View style={[styles.previewBox, { backgroundColor: overStock ? "#fdecea" : colors.card }]}>
                          <FontAwesome6
                            name={overStock ? "triangle-exclamation" : "circle-info"}
                            size={14}
                            color={overStock ? "#c0392b" : colors.mediumRed}
                          />
                          {overStock ? (
                            <Text style={[styles.previewText, { color: "#c0392b" }]}>
                              {" "}Estoque insuficiente! Disponível: {selectedProduct.quantity} un.
                            </Text>
                          ) : (
                            <Text style={[styles.previewText, { color: colors.text }]}>
                              {" "}Total: {toCurrencyDisplay(total)}  •  {inst}x de {toCurrencyDisplay(total / inst)}
                            </Text>
                          )}
                        </View>
                      ) : null}
                    </View>
                  );
                })}

                {/* Botão adicionar item */}
                <TouchableOpacity
                  style={[styles.addItemBtn, { borderColor: colors.mediumRed }]}
                  onPress={addOrderItem}
                >
                  <FontAwesome6 name="plus" size={13} color={colors.mediumRed} />
                  <Text style={[styles.addItemBtnText, { color: colors.mediumRed }]}>
                    Adicionar outro produto
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalButtons}>
                  <Button mode="outlined" onPress={closeOrderModal} style={[styles.modalBtn, { borderColor: colors.mediumRed }]} labelStyle={{ color: colors.mediumRed }}>
                    Cancelar
                  </Button>
                  <Button mode="contained" onPress={handleSaveOrder} style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]} labelStyle={{ color: "#fff" }}>
                    Criar pedido{orderItems.length > 1 ? `s (${orderItems.length})` : ""}
                  </Button>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Modal Adicionar Parcela ───────────────────────────────────────── */}
      {/* FIX: mesmo padrão de separação overlay/KeyboardAvoidingView */}
      <Modal
        visible={addInstallmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddInstallmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingModal}>
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Adicionar Parcela</Text>
                <TouchableOpacity onPress={() => setAddInstallmentModal(false)}>
                  <FontAwesome6 name="xmark" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Valor da parcela *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.background }]}
                placeholder="0,00"
                placeholderTextColor={colors.text + "66"}
                keyboardType="numeric"
                value={addInstallmentValue}
                onChangeText={(v) => setAddInstallmentValue(formatCurrency(v))}
              />

              <View style={styles.modalButtons}>
                <Button mode="outlined" onPress={() => setAddInstallmentModal(false)} style={[styles.modalBtn, { borderColor: colors.mediumRed }]} labelStyle={{ color: colors.mediumRed }}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    const client = clients.find((c) =>
                      c.orders?.some((o) => o.orderId === selectedOrderId)
                    );
                    if (client) handleAddInstallment(client.clientId);
                  }}
                  style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]}
                  labelStyle={{ color: "#fff" }}
                >
                  Adicionar
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "600" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, elevation: 2, gap: 4 },
  summaryValue: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  summaryLabel: { fontSize: 10, opacity: 0.6, textAlign: "center" },

  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  empty: { textAlign: "center", opacity: 0.5, fontSize: 15 },

  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  iconContainer: { padding: 10, borderRadius: 12 },
  expandedContent: { paddingTop: 4, paddingBottom: 8, gap: 6 },
  infoText: { fontSize: 14, opacity: 0.75, marginBottom: 2 },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  actionButton: { flex: 1, borderRadius: 10, minWidth: 80 },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginTop: 14, marginBottom: 6, opacity: 0.8 },

  orderCard: { borderRadius: 12, padding: 12, marginBottom: 8 },
  orderHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderTitle: { fontSize: 14, fontWeight: "600" },
  orderSubtitle: { fontSize: 12, opacity: 0.6, marginTop: 2 },

  installmentList: { marginTop: 10, gap: 8 },
  installmentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  installmentText: { fontSize: 13 },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#d5f5e3", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  paidText: { color: "#27ae60", fontSize: 12, fontWeight: "600" },
  payButton: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  payButtonText: { fontSize: 12, fontWeight: "600" },

  fab: { position: "absolute", bottom: 28, right: 24, width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4 },

  // FIX: overlay e KeyboardAvoidingView separados
  modalOverlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  keyboardAvoidingModal: { width: "100%" },
  modalBox: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, elevation: 10, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4, marginTop: 10, opacity: 0.8 },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  modalBtn: { flex: 1, borderRadius: 12 },

  previewBox: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, marginTop: 10 },
  previewText: { fontSize: 13, fontWeight: "600", flexShrink: 1 },
  hintText: { fontSize: 12, opacity: 0.55, marginTop: 10, lineHeight: 17 },

  // Seletor de produto compacto (dropdown)
  productSelector: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  productPicker: { maxHeight: 150, borderWidth: 1.5, borderRadius: 10, marginTop: 4, padding: 4 },
  productOption: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1.5, marginBottom: 6 },
  productOptionName: { fontSize: 14, fontWeight: "600" },
  productOptionSub: { fontSize: 12, opacity: 0.6, marginTop: 1 },
  noStockText: { padding: 10, opacity: 0.6, fontSize: 13, textAlign: "center" },

  // Bloco de cada item no modal de pedido
  orderItemBlock: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  orderItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  orderItemTitle: { fontSize: 13, fontWeight: "700" },

  // Botão adicionar item
  addItemBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, marginBottom: 4 },
  addItemBtnText: { fontSize: 14, fontWeight: "600" },

  row: { flexDirection: "row" },
});