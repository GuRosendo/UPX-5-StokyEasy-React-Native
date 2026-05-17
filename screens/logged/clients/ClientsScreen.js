import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { useRef } from "react";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCallback } from "react";
import { useTheme } from "../../../components/ThemeContext";
import { toCurrencyDisplay } from "../shared/helpers";
import { useClients } from "./useClients";
import { ClientCard } from "./ClientCard";
import { ClientModal } from "./ClientModal";
import { OrderModal } from "./OrderModal";
import { EditOrderModal } from "./EditOrderModal";
import { AddInstallmentModal } from "./AddInstallmentModal";
import { ConfirmModal } from "../../../components/general/ConfirmModal";
import { Pagination } from "../../../components/general/Pagination";
import { styles } from "./clients.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ClientsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const {
    clients, allClients, userProducts,
    expandedClientId, expandedOrderId,
    page, totalPages, totalItems, pageSize, goNext, goPrev,
    totalClients, totalActiveOrders, totalPending, totalCompleted,
    searchQuery, handleSearchChange, setSearchQuery, searchVisible, toggleSearch,
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
  } = useClients();

  const handleToggleSearch = () => {
    toggleSearch();
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // ── Callbacks estáveis — evitam invalidar o memo dos cards ────────────────
  const keyExtractor = useCallback((item) => item.clientId, []);

  const renderItem = useCallback(({ item: client }) => (
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
  ), [
    expandedClientId, expandedOrderId, showCompleted, colors,
    toggleClient, toggleOrder, openCreateOrder, openEditClient,
    handleDeleteClient, handlePayInstallment, handleUnpayInstallment,
    openEditOrder, handleCancelOrder, handleCompleteOrder,
    handleRecoverOrder, handleDeleteCancelledOrder,
  ]);

  const ListHeader = (
    <>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        Clientes
      </Text>

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
          <Text style={[styles.summaryValue, { color: colors.text }]}>{toCurrencyDisplay(totalPending)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>A receber</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <FontAwesome6 name="circle-check" size={18} color="#27ae60" />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{totalCompleted}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Finalizados</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowCompleted(!showCompleted)}
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

      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.mediumRed }]}>
          <FontAwesome6 name="magnifying-glass" size={14} color={colors.text} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nome, email, telefone..."
            placeholderTextColor={colors.text + "66"}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); handleSearchChange(""); }}>
              <FontAwesome6 name="xmark" size={14} color={colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  const ListFooter = (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onNext={goNext}
      onPrev={goPrev}
      colors={colors}
    />
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
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        ref={flatListRef}
        data={clients}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        renderItem={renderItem}
      />

      <View style={[styles.fabRow, { backgroundColor: colors.background + "F0" }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[styles.fabSecondary, { backgroundColor: searchVisible ? colors.mediumRed : colors.card }]}
          onPress={handleToggleSearch}
          activeOpacity={0.85}
        >
          <FontAwesome6 name="magnifying-glass" size={18} color={searchVisible ? "#fff" : colors.mediumRed} />
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

      {/* ── Modais de form ── */}
      <ClientModal
        visible={clientModal}
        editingClient={editingClient}
        form={clientForm}
        setForm={setClientForm}
        onSave={handleSaveClient}
        onClose={closeClientModal}
        colors={colors}
      />
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
      <AddInstallmentModal
        visible={addInstallmentModal}
        value={addInstallmentValue}
        setValue={setAddInstallmentValue}
        onSave={() => {
          const client = clients.find((c) => c.orders?.some((o) => o.orderId === selectedOrderId));
          if (client) handleAddInstallment(client.clientId);
        }}
        onClose={() => setAddInstallmentModal(false)}
        colors={colors}
      />

      {/* ── Modais de confirmação ── */}
      <ConfirmModal
        visible={confirmDeleteClient.visible}
        title="Excluir cliente"
        message={`Excluir "${confirmDeleteClient.client?.name}" e todos os seus pedidos?`}
        confirmText="Excluir"
        isDanger={true}
        onConfirm={_doDeleteClient}
        onClose={() => setConfirmDeleteClient({ visible: false, client: null })}
      />
      <ConfirmModal
        visible={confirmCancelOrder.visible}
        title="Cancelar pedido"
        message="O estoque será devolvido. Deseja continuar?"
        confirmText="Cancelar"
        cancelText="Voltar"
        isDanger={true}
        onConfirm={_doCancelOrder}
        onClose={() => setConfirmCancelOrder({ visible: false, clientId: null, orderId: null })}
      />
      <ConfirmModal
        visible={confirmDeleteOrder.visible}
        title="Excluir pedido"
        message="Esta ação é irreversível. O estoque será devolvido."
        confirmText="Excluir"
        cancelText="Voltar"
        isDanger={true}
        onConfirm={_doDeleteOrder}
        onClose={() => setConfirmDeleteOrder({ visible: false, clientId: null, orderId: null })}
      />
      <ConfirmModal
        visible={confirmRecoverOrder.visible}
        title="Recuperar pedido"
        message="O pedido voltará como ativo e o estoque será deduzido novamente."
        confirmText="Recuperar"
        cancelText="Voltar"
        isDanger={false}
        onConfirm={_doRecoverOrder}
        onClose={() => setConfirmRecoverOrder({ visible: false, clientId: null, orderId: null })}
      />
      <ConfirmModal
        visible={confirmCompleteOrder.visible}
        title="Finalizar pedido"
        message="Marcar este pedido como finalizado? Ele será movido para o histórico de concluídos."
        confirmText="Finalizar"
        cancelText="Voltar"
        isDanger={false}
        onConfirm={_doCompleteOrder}
        onClose={() => setConfirmCompleteOrder({ visible: false, clientId: null, orderId: null })}
      />
      <ConfirmModal
        visible={confirmDeleteCancelled.visible}
        title="Excluir do histórico"
        message="Remover este pedido cancelado permanentemente?"
        confirmText="Excluir"
        cancelText="Voltar"
        isDanger={true}
        onConfirm={_doDeleteCancelledOrder}
        onClose={() => setConfirmDeleteCancelled({ visible: false, clientId: null, orderId: null })}
      />
      <ConfirmModal
        visible={confirmPayInstallment.visible}
        title="Confirmar pagamento"
        message="Marcar esta parcela como paga?"
        confirmText="Confirmar"
        isDanger={false}
        onConfirm={_doPayInstallment}
        onClose={() => setConfirmPayInstallment({ visible: false, clientId: null, orderId: null, installmentId: null })}
      />
      <ConfirmModal
        visible={confirmUnpayInstallment.visible}
        title="Cancelar pagamento"
        message="Marcar esta parcela como não paga?"
        confirmText="Confirmar"
        cancelText="Voltar"
        isDanger={true}
        onConfirm={_doUnpayInstallment}
        onClose={() => setConfirmUnpayInstallment({ visible: false, clientId: null, orderId: null, installmentId: null })}
      />
      <ConfirmModal
        visible={confirmAllPaidComplete.visible}
        title="Pedido concluído!"
        message="Todas as parcelas foram pagas. Deseja marcar este pedido como finalizado?"
        confirmText="Finalizar"
        cancelText="Deixar ativo"
        isDanger={false}
        onConfirm={() => _doCompleteOrder()}
        onClose={() => setConfirmAllPaidComplete({ visible: false, orderId: null })}
      />
    </View>
  );
}