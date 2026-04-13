import { View, Modal, TextInput, ScrollView, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { toCurrencyDisplay } from "../shared/helpers";
import { styles } from "./clients.styles";

export function OrderModal({
  visible,
  userProducts,
  orderItems,
  pickerOpenIndex,
  setPickerOpenIndex,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onSave,
  onClose,
  colors,
}) {
  const availableProducts = userProducts.filter((p) => p.quantity > 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingModal}
        >
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            {/* Cabeçalho */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Pedido</Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Um bloco por item de pedido */}
              {orderItems.map((item, index) => {
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
                        <TouchableOpacity onPress={() => onRemoveItem(index)}>
                          <FontAwesome6 name="trash" size={15} color="#c0392b" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Seletor de produto */}
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
                                  onUpdateItem(index, "productId", p.productId);
                                  setPickerOpenIndex(null);
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.productOptionName, { color: colors.text }]}>
                                    {p.name}
                                  </Text>
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

                    {/* Quantidade + Parcelas */}
                    <View style={styles.row}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.label, { color: colors.text }]}>Quantidade *</Text>
                        <TextInput
                          style={[styles.input, { borderColor: colors.mediumRed, color: colors.text, backgroundColor: colors.card }]}
                          placeholder="1"
                          placeholderTextColor={colors.text + "66"}
                          keyboardType="numeric"
                          value={item.quantity}
                          onChangeText={(v) => onUpdateItem(index, "quantity", v.replace(/\D/g, ""))}
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
                          onChangeText={(v) => onUpdateItem(index, "installments", v.replace(/\D/g, ""))}
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

              {/* Adicionar item */}
              <TouchableOpacity
                style={[styles.addItemBtn, { borderColor: colors.mediumRed }]}
                onPress={onAddItem}
              >
                <FontAwesome6 name="plus" size={13} color={colors.mediumRed} />
                <Text style={[styles.addItemBtnText, { color: colors.mediumRed }]}>
                  Adicionar outro produto
                </Text>
              </TouchableOpacity>

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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
