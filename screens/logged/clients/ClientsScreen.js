import { View, FlatList, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../../components/ThemeContext";
import { toCurrencyDisplay } from "../shared/helpers";
import { useClients } from "./useClients";
import { ClientCard } from "./ClientCard";
import { ClientModal } from "./ClientModal";
import { OrderModal } from "./OrderModal";
import { AddInstallmentModal } from "./AddInstallmentModal";
import { styles } from "./clients.styles";

export default function ClientsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  const {
    clients,
    userProducts,
    expandedClientId,
    expandedOrderId,
    totalClients,
    totalActiveOrders,
    totalPending,
    clientModal,
    editingClient,
    clientForm,
    setClientForm,
    openCreateClient,
    openEditClient,
    closeClientModal,
    handleSaveClient,
    handleDeleteClient,
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
    addInstallmentModal,
    addInstallmentValue,
    setAddInstallmentValue,
    selectedOrderId,
    openAddInstallment,
    handleAddInstallment,
    setAddInstallmentModal,
    handlePayInstallment,
    handleCancelOrder,
    toggleClient,
    toggleOrder,
  } = useClients();

  const ListHeader = (
    <>
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
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <FontAwesome6 name="user-slash" size={48} color={colors.mediumRed} style={{ opacity: 0.4 }} />
      <Text style={[styles.empty, { color: colors.text }]}>
        Nenhum cliente cadastrado ainda.
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.clientId}
        contentContainerStyle={styles.container}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={<View style={{ height: 100 }} />}
        renderItem={({ item: client }) => (
          <ClientCard
            client={client}
            isExpanded={expandedClientId === client.clientId}
            expandedOrderId={expandedOrderId}
            onToggleClient={toggleClient}
            onToggleOrder={toggleOrder}
            onNewOrder={openCreateOrder}
            onEditClient={openEditClient}
            onDeleteClient={handleDeleteClient}
            onPayInstallment={handlePayInstallment}
            onAddInstallment={openAddInstallment}
            onCancelOrder={handleCancelOrder}
            colors={colors}
          />
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.mediumRed }]}
        onPress={openCreateClient}
        activeOpacity={0.85}
      >
        <FontAwesome6 name="user-plus" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Modal de cliente */}
      <ClientModal
        visible={clientModal}
        editingClient={editingClient}
        form={clientForm}
        setForm={setClientForm}
        onSave={handleSaveClient}
        onClose={closeClientModal}
        colors={colors}
      />

      {/* Modal de pedido */}
      <OrderModal
        visible={orderModal}
        userProducts={userProducts}
        orderItems={orderItems}
        pickerOpenIndex={pickerOpenIndex}
        setPickerOpenIndex={setPickerOpenIndex}
        onAddItem={addOrderItem}
        onRemoveItem={removeOrderItem}
        onUpdateItem={updateOrderItem}
        onSave={handleSaveOrder}
        onClose={closeOrderModal}
        colors={colors}
      />

      {/* Modal de parcela */}
      <AddInstallmentModal
        visible={addInstallmentModal}
        value={addInstallmentValue}
        setValue={setAddInstallmentValue}
        onSave={() => {
          const client = clients.find((c) =>
            c.orders?.some((o) => o.orderId === selectedOrderId)
          );
          if (client) handleAddInstallment(client.clientId);
        }}
        onClose={() => setAddInstallmentModal(false)}
        colors={colors}
      />
    </View>
  );
}