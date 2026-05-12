import { View, TouchableOpacity, FlatList } from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { toCurrencyDisplay } from "../shared/helpers";
import { styles } from "./clients.styles";

function tsToDateStr(ts) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString("pt-BR");
}

export function OrderCard({
  order,
  clientId,
  isExpanded,
  onToggle,
  onPayInstallment,
  onUnpayInstallment,
  onEditOrder,
  onCancelOrder,
  colors,
}) {
  const paidCount  = order.installments.filter((i) => i.paid).length;
  const totalCount = order.installments.length;
  const pending    = order.installments.filter((i) => !i.paid).reduce((a, i) => a + i.value, 0);

  const renderInstallment = ({ item: inst }) => {
    const dateStr = tsToDateStr(inst.dueDate);
    return (
      <View style={styles.installmentRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.installmentText, { color: colors.text }]}>
            {inst.index}ª parcela — {toCurrencyDisplay(inst.value)}
          </Text>
          {dateStr ? (
            <Text style={[styles.installmentDate, { color: colors.text }]}>
              <FontAwesome6 name="calendar" size={10} color={colors.mediumRed} /> {dateStr}
            </Text>
          ) : null}
        </View>

        {inst.paid ? (
          <TouchableOpacity
            style={styles.paidBadge}
            onPress={() => onUnpayInstallment(clientId, order.orderId, inst.installmentId)}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="check" size={11} color="#27ae60" />
            <Text style={styles.paidText}>Pago</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.payButton, { borderColor: colors.mediumRed }]}
            onPress={() => onPayInstallment(clientId, order.orderId, inst.installmentId)}
          >
            <Text style={[styles.payButtonText, { color: colors.mediumRed }]}>Quitar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.orderCard, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <TouchableOpacity onPress={() => onToggle(order.orderId)}>
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.orderTitle, { color: colors.text }]}>
              {order.productRef || "Pedido"} — {toCurrencyDisplay(order.totalValue)}
            </Text>
            <Text style={[styles.orderSubtitle, { color: colors.text }]}>
              {paidCount}/{totalCount} quitadas • Pendente: {toCurrencyDisplay(pending)}
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

      {/* Detalhes */}
      {isExpanded && (
        <View style={styles.installmentList}>
          <FlatList
            data={order.installments}
            keyExtractor={(inst) => inst.installmentId}
            renderItem={renderInstallment}
            scrollEnabled={false}
          />

          <View style={[styles.actionRow, { marginTop: 10 }]}>
            <Button
              mode="contained"
              icon="pencil"
              style={[styles.actionButton, { backgroundColor: colors.mediumRed }]}
              labelStyle={{ color: "#fff", fontSize: 11 }}
              onPress={() => onEditOrder(clientId, order)}
            >
              Editar
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
