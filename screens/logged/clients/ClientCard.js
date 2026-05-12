import { View, TouchableOpacity, FlatList } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { OrderCard } from "./OrderCard";
import { styles } from "./clients.styles";

export function ClientCard({
  client,
  isExpanded,
  expandedOrderId,
  onToggleClient,
  onToggleOrder,
  onNewOrder,
  onEditClient,
  onDeleteClient,
  onPayInstallment,
  onUnpayInstallment,
  onEditOrder,
  onCancelOrder,
  onRecoverOrder,
  onDeleteCancelledOrder,
  colors,
}) {
  const activeOrders    = (client.orders || []).filter((o) => o.status === "active");
  const cancelledOrders = (client.orders || []).filter((o) => o.status === "cancelled");

  return (
    <View>
      <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
        {/* Apenas o header é clicável para expandir/colapsar */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => onToggleClient(client.clientId)}>
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
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
                style={{ marginRight: 16, opacity: 0.5 }}
              />
            )}
          />
        </TouchableOpacity>

          {isExpanded && (
            <Card.Content style={styles.expandedContent}>
              {/* Contato */}
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

              {/* Ações do cliente */}
              <View style={styles.actionRow}>
                <Button
                  mode="contained"
                  icon="plus"
                  style={[styles.actionButton, { backgroundColor: colors.mediumRed }]}
                  labelStyle={{ color: "#fff", fontSize: 12 }}
                  onPress={() => onNewOrder(client.clientId)}
                >
                  Novo pedido
                </Button>
                <Button
                  mode="outlined"
                  icon="pencil"
                  style={[styles.actionButton, { borderColor: colors.mediumRed }]}
                  labelStyle={{ color: colors.mediumRed, fontSize: 12 }}
                  onPress={() => onEditClient(client)}
                >
                  Editar
                </Button>
                <Button
                  mode="outlined"
                  icon="trash-can-outline"
                  style={[styles.actionButton, { borderColor: "#c0392b" }]}
                  labelStyle={{ color: "#c0392b", fontSize: 12 }}
                  onPress={() => onDeleteClient(client)}
                >
                  Excluir
                </Button>
              </View>

              {/* Pedidos ativos */}
              {activeOrders.length > 0 && (
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Pedidos ativos</Text>
              )}
              <FlatList
                data={activeOrders}
                keyExtractor={(order) => order.orderId}
                scrollEnabled={false}
                renderItem={({ item: order }) => (
                  <OrderCard
                    order={order}
                    clientId={client.clientId}
                    isExpanded={expandedOrderId === order.orderId}
                    onToggle={onToggleOrder}
                    onPayInstallment={onPayInstallment}
                    onUnpayInstallment={onUnpayInstallment}
                    onEditOrder={onEditOrder}
                    onCancelOrder={onCancelOrder}
                    colors={colors}
                  />
                )}
              />

              {/* Pedidos cancelados */}
              {cancelledOrders.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.text, opacity: 0.5 }]}>
                    Cancelados
                  </Text>
                  {cancelledOrders.map((order) => (
                    <View
                      key={order.orderId}
                      style={[
                        styles.cancelledOrderCard,
                        { backgroundColor: colors.background, borderColor: colors.text + "18" },
                      ]}
                    >
                      {/* Info do pedido cancelado */}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.orderTitle, { color: colors.text, opacity: 0.55 }]}>
                          {order.productRef || "Pedido"}
                        </Text>
                        <Text style={[styles.orderSubtitle, { color: colors.text, opacity: 0.45 }]}>
                          Cancelado ✕  •  Qtd: {order.quantity}
                        </Text>
                      </View>

                      {/* Ações: Recuperar + Excluir */}
                      <View style={styles.cancelledActions}>
                        <TouchableOpacity
                          style={[styles.cancelledActionBtn, { borderColor: "#27ae60" }]}
                          onPress={() => onRecoverOrder(client.clientId, order.orderId)}
                        >
                          <FontAwesome6 name="rotate-left" size={12} color="#27ae60" />
                          <Text style={[styles.cancelledActionText, { color: "#27ae60" }]}>
                            Recuperar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.cancelledActionBtn, { borderColor: "#c0392b" }]}
                          onPress={() => onDeleteCancelledOrder(client.clientId, order.orderId)}
                        >
                          <FontAwesome6 name="trash" size={12} color="#c0392b" />
                          <Text style={[styles.cancelledActionText, { color: "#c0392b" }]}>
                            Excluir
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </Card.Content>
          )}
        </Card>
    </View>
  );
}