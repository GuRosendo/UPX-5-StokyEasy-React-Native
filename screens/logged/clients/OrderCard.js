import { View, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { toCurrencyDisplay } from "../shared/helpers";
import { styles } from "./clients.styles";

export function OrderCard({
  order,
  clientId,
  isExpanded,
  onToggle,
  onPayInstallment,
  onAddInstallment,
  onCancelOrder,
  colors,
}) {
  const paidCount = order.installments.filter((i) => i.paid).length;
  const totalCount = order.installments.length;
  const pending = order.installments
    .filter((i) => !i.paid)
    .reduce((a, i) => a + i.value, 0);

  return (
    <View style={[styles.orderCard, { backgroundColor: colors.background }]}>
      {/* Cabeçalho do pedido */}
      <TouchableOpacity onPress={() => onToggle(order.orderId)}>
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
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={12}
            color={colors.text}
            style={{ opacity: 0.5 }}
          />
        </View>
      </TouchableOpacity>

      {/* Detalhes expandidos */}
      {isExpanded && (
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
                  onPress={() => onPayInstallment(clientId, order.orderId, inst.installmentId)}
                >
                  <Text style={[styles.payButtonText, { color: colors.mediumRed }]}>Quitar</Text>
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
              onPress={() => onAddInstallment(order.orderId)}
            >
              + Parcela
            </Button>
            <Button
              mode="outlined"
              icon="close"
              style={[styles.actionButton, { borderColor: "#c0392b" }]}
              labelStyle={{ color: "#c0392b", fontSize: 11 }}
              onPress={() => onCancelOrder(clientId, order.orderId)}
            >
              Cancelar
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
