import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../../components/ThemeContext";
import { toCurrencyDisplay } from "../shared/helpers";
import { useClients } from "./useClients";
import { ClientCard } from "./ClientCard";
import { ClientModal } from "./ClientModal";
import { OrderModal } from "./OrderModal";
import { EditOrderModal } from "./EditOrderModal";
import { AddInstallmentModal } from "./AddInstallmentModal";
import { styles } from "./clients.styles";

export default function ClientsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  const {
    clients, allClients, userProducts,
    expandedClientId, expandedOrderId,
    totalClients, totalActiveOrders, totalPending, totalCompleted,
    searchQuery, setSearchQuery, searchVisible, toggleSearch,
    showCompleted, setShowCompleted,
    clientModal, editingClient, clientForm, setClientForm,
    openCreateClient, openEditClient, closeClientModal, handleSaveClient, handleDeleteClient,
    orderModal, orderItems, pickerOpenIndex, setPickerOpenIndex,
    orderFirstDueDate, setOrderFirstDueDate,
    openCreateOrder, closeOrderModal, addOrderItem, removeOrderItem, updateOrderItem, handleSaveOrder,
    editOrderModal, editingOrder, editingClientId, editingClientObj,
    openEditOrder, closeEditOrderModal, handleSaveEditedOrder,
    addInstallmentModal, addInstallmentValue, setAddInstallmentValue,
    selectedOrderId, openAddInstallment, handleAddInstallment, setAddInstallmentModal,
    handlePayInstallment, handleUnpayInstallment,
    handleCancelOrder, handleDeleteOrder,
    handleCompleteOrder,
    handleRecoverOrder, handleDeleteCancelledOrder,
    toggleClient, toggleOrder,
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
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <FontAwesome6 name="circle-check" size={18} color="#27ae60" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalCompleted}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Finalizados</Text>
        </View>
      </View>

      {/* Filtro de pedidos finalizados */}
      <TouchableOpacity
        onPress={() => setShowCompleted((v) => !v)}
        style={[
          styles.filterToggle,
          {
            backgroundColor: showCompleted ? "#27ae6022" : colors.card,
            borderColor:      showCompleted ? "#27ae60"   : colors.text + "22",
          },
        ]}
        activeOpacity={0.8}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: showCompleted ? "#27ae60" : "transparent",
            borderColor:      showCompleted ? "#27ae60" : colors.text + "55",
          },
        ]}>
          {showCompleted && <FontAwesome6 name="check" size={10} color="#fff" />}
        </View>
        <Text style={[styles.filterToggleText, { color: showCompleted ? "#27ae60" : colors.text }]}>
          Exibir apenas pedidos finalizados
        </Text>
        {totalCompleted > 0 && (
          <View style={[styles.filterBadge, { backgroundColor: "#27ae60" }]}>
            <Text style={styles.filterBadgeText}>{totalCompleted}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Barra de busca */}
      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.mediumRed }]}>
          <FontAwesome6 name="magnifying-glass" size={14} color={colors.text} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nome, email, telefone..."
            placeholderTextColor={colors.text + "66"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <FontAwesome6 name="xmark" size={14} color={colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <FontAwesome6
        name={showCompleted ? "circle-check" : "user-slash"}
        size={48}
        color={showCompleted ? "#27ae60" : colors.mediumRed}
        style={{ opacity: 0.4 }}
      />
      <Text style={[styles.empty, { color: colors.text }]}>
        {showCompleted
          ? "Nenhum pedido finalizado ainda."
          : searchQuery
          ? "Nenhum cliente encontrado."
          : "Nenhum cliente cadastrado ainda."}
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
            onUnpayInstallment={handleUnpayInstallment}
            onEditOrder={openEditOrder}
            onCancelOrder={handleCancelOrder}
            onCompleteOrder={handleCompleteOrder}
            onRecoverOrder={handleRecoverOrder}
            onDeleteCancelledOrder={handleDeleteCancelledOrder}
            showCompleted={showCompleted}
            colors={colors}
          />
        )}
      />

      {/* FABs — lupa + adicionar cliente (ocultar no modo finalizado) */}
      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[
            styles.fabSecondary,
            { backgroundColor: searchVisible ? colors.mediumRed : colors.card },
          ]}
          onPress={toggleSearch}
          activeOpacity={0.85}
        >
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color={searchVisible ? "#fff" : colors.mediumRed}
          />
        </TouchableOpacity>
        {!showCompleted && (
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.mediumRed }]}
            onPress={openCreateClient}
            activeOpacity={0.85}
          >
            <FontAwesome6 name="user-plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal cliente */}
      <ClientModal
        visible={clientModal}
        editingClient={editingClient}
        form={clientForm}
        setForm={setClientForm}
        onSave={handleSaveClient}
        onClose={closeClientModal}
        colors={colors}
      />

      {/* Modal novo pedido */}
      <OrderModal
        visible={orderModal}
        userProducts={userProducts}
        orderItems={orderItems}
        pickerOpenIndex={pickerOpenIndex}
        setPickerOpenIndex={setPickerOpenIndex}
        firstDueDate={orderFirstDueDate}
        setFirstDueDate={setOrderFirstDueDate}
        onAddItem={addOrderItem}
        onRemoveItem={removeOrderItem}
        onUpdateItem={updateOrderItem}
        onSave={handleSaveOrder}
        onClose={closeOrderModal}
        colors={colors}
      />

      {/* Modal editar pedido */}
      <EditOrderModal
        visible={editOrderModal}
        order={editingOrder}
        clientId={editingClientId}
        client={editingClientObj}
        userProducts={userProducts}
        onClose={closeEditOrderModal}
        onSave={handleSaveEditedOrder}
        onCancelOrder={handleCancelOrder}
        onDeleteOrder={handleDeleteOrder}
        colors={colors}
      />

      {/* Modal parcela */}
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