import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { Input } from "../../../components/general/Input";
import { toCurrencyDisplay } from "../shared/helpers";
import { ProductPickerModal } from "./ProductPickerModal";
import { styles } from "./clients.styles";
import { useState } from "react";

function addMonths(ts, n) {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

function tsToDateBR(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR");
}

export function OrderModal({
  visible,
  userProducts,
  orderItems,
  pickerOpenIndex,      // mantido por compatibilidade mas não mais usado para scroll
  setPickerOpenIndex,
  firstDueDate,
  setFirstDueDate,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onSave,
  onClose,
  colors,
}) {
  // Controla qual índice de item está com o ProductPickerModal aberto
  const [productModalIndex, setProductModalIndex] = useState(null);

  const availableProducts = userProducts.filter((p) => p.quantity > 0);

  const handleProductSelect = (index, productId) => {
    onUpdateItem(index, "productId", productId);
    setProductModalIndex(null);
  };

  const renderOrderItem = ({ item, index }) => {
    const selectedProduct = userProducts.find((p) => p.productId === item.productId);
    const qty       = parseInt(item.quantity, 10) || 0;
    const inst      = parseInt(item.installments, 10) || 1;
    const total     = selectedProduct ? selectedProduct.price * qty : 0;
    const overStock = selectedProduct && qty > selectedProduct.quantity;

    return (
      <View
        style={[
          styles.orderItemBlock,
          { borderColor: colors.mediumRed + "40", backgroundColor: colors.background },
        ]}
      >
        {/* Cabeçalho do item */}
        <View style={styles.orderItemHeader}>
          <Text style={[styles.orderItemTitle, { color: colors.mediumRed }]}>
            Item {index + 1}
          </Text>
          {orderItems.length > 1 && (
            <TouchableOpacity onPress={() => onRemoveItem(index)}>
              <FontAwesome6 name="trash" size={15} color="#c0392b" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Seletor de produto — abre modal próprio ── */}
        <Text style={[styles.label, { color: colors.text }]}>Produto *</Text>
        <TouchableOpacity
          style={[
            styles.productSelector,
            { borderColor: colors.mediumRed, backgroundColor: colors.card },
          ]}
          onPress={() => setProductModalIndex(index)}
          activeOpacity={0.75}
        >
          <Text
            style={{
              color: selectedProduct ? colors.text : colors.text + "66",
              flex: 1,
              fontSize: 14,
            }}
          >
            {selectedProduct ? selectedProduct.name : "Selecione um produto..."}
          </Text>
          <FontAwesome6 name="chevron-right" size={12} color={colors.text} style={{ opacity: 0.5 }} />
        </TouchableOpacity>

        {/* Quantidade + Parcelas */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Quantidade *"
              icon="cubes"
              placeholder="1"
              keyboardType="numeric"
              value={item.quantity}
              onChangeText={(v) => onUpdateItem(index, "quantity", v.replace(/\D/g, ""))}
              returnKeyType="next"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input
              label="Parcelas *"
              icon="layer-group"
              placeholder="1"
              keyboardType="numeric"
              value={item.installments}
              onChangeText={(v) => onUpdateItem(index, "installments", v.replace(/\D/g, ""))}
              returnKeyType="done"
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
                {" "}Total: {toCurrencyDisplay(total)} • {inst}x de {toCurrencyDisplay(total / inst)}
              </Text>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const ListFooter = (
    <>
      <TouchableOpacity
        style={[styles.addItemBtn, { borderColor: colors.mediumRed }]}
        onPress={onAddItem}
      >
        <FontAwesome6 name="plus" size={13} color={colors.mediumRed} />
        <Text style={[styles.addItemBtnText, { color: colors.mediumRed }]}>
          Adicionar outro produto
        </Text>
      </TouchableOpacity>

      {/* ── Data da 1ª parcela ── */}
      <View
        style={[
          styles.dueDateSection,
          { borderColor: colors.mediumRed + "33", backgroundColor: colors.background, marginBottom: 4 },
        ]}
      >
        <Text
          style={[styles.sectionLabel, { color: colors.text, marginTop: 0, marginBottom: 8 }]}
        >
          Datas de vencimento
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Data da 1ª parcela (opcional)"
              icon="calendar-days"
              placeholder="Selecione a data"
              isDate={true}
              useTodayAsMin={false}
              useTodayAsDefaultValue={!firstDueDate}
              initialDate={
                firstDueDate
                  ? new Date(firstDueDate).toISOString().split("T")[0]
                  : undefined
              }
              value={firstDueDate ? tsToDateBR(firstDueDate) : ""}
              setDateSelected={(dateObj) => {
                const ts =
                  dateObj instanceof Date
                    ? dateObj.getTime()
                    : new Date(dateObj).getTime();
                setFirstDueDate(ts);
              }}
            />
          </View>
          {firstDueDate ? (
            <TouchableOpacity
              onPress={() => setFirstDueDate(null)}
              style={{ marginTop: 28 }}
            >
              <FontAwesome6
                name="xmark"
                size={16}
                color={colors.text}
                style={{ opacity: 0.4 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={[styles.hintText, { color: colors.text }]}>
          As demais parcelas serão geradas mensalmente a partir desta data.
        </Text>
      </View>

      <View style={styles.modalButtons}>
        <Button
          mode="outlined"
          onPress={onClose}
          style={[styles.modalBtn, { borderColor: colors.mediumRed }]}
          labelStyle={{ color: colors.mediumRed }}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={onSave}
          style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]}
          labelStyle={{ color: "#fff" }}
        >
          Criar pedido{orderItems.length > 1 ? `s (${orderItems.length})` : ""}
        </Button>
      </View>
    </>
  );

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Pedido</Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={orderItems}
              keyExtractor={(_, index) => String(index)}
              renderItem={renderOrderItem}
              ListFooterComponent={ListFooter}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de seleção de produto — fora do FlatList, sem scroll aninhado */}
      <ProductPickerModal
        visible={productModalIndex !== null}
        products={availableProducts}
        selectedId={
          productModalIndex !== null
            ? orderItems[productModalIndex]?.productId
            : null
        }
        onSelect={(productId) => handleProductSelect(productModalIndex, productId)}
        onClose={() => setProductModalIndex(null)}
        colors={colors}
      />
    </>
  );
}