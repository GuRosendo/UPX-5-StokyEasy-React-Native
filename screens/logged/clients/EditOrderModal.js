/**
 * EditOrderModal
 * Correções aplicadas:
 *  1. Datas exibidas em formato BR (dd/mm/aaaa) usando formatDate
 *  2. DateTimePickerCustom NÃO injeta data de hoje quando a parcela não tem dueDate
 *     — o picker só abre quando o usuário toca; exibimos um placeholder textual enquanto não há data
 *  3. Todos os textos usam colors.text do tema
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { Input } from "../../../components/general/Input";
import { formatDate } from "../../../functions/general/Masks";
import { toCurrencyDisplay, formatCurrency, parseCurrency } from "../shared/helpers";
import { styles } from "./clients.styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Timestamp → "dd/mm/aaaa" usando o mesmo formatDate do projeto */
function tsToDateBR(ts) {
  if (!ts) return "";
  return formatDate(new Date(ts), "BR", false);
}

function addMonths(ts, n) {
  const d = new Date(ts);
  d.setMonth(d.getMonth() + n);
  return d.getTime();
}

// ─── WhatsApp text builder ────────────────────────────────────────────────────

function buildOrderText(order, client) {
  const lines = [];
  lines.push(`📦 *Pedido — ${client?.name ?? "Cliente"}*`);
  lines.push(`Produto: ${order.productRef || "—"}`);
  lines.push(`Quantidade: ${order.quantity}`);
  lines.push(`Valor total: ${toCurrencyDisplay(order.totalValue)}`);
  lines.push("");
  lines.push(`📋 *Parcelas (${order.installments.length})*`);

  const paidTotal    = order.installments.filter((i) => i.paid).reduce((s, i) => s + i.value, 0);
  const pendingTotal = order.installments.filter((i) => !i.paid).reduce((s, i) => s + i.value, 0);

  order.installments.forEach((inst) => {
    const dateStr = inst.dueDate ? ` — venc. ${tsToDateBR(inst.dueDate)}` : "";
    const status  = inst.paid ? "✅ Pago" : "⏳ Pendente";
    lines.push(`  ${inst.index}ª parcela: ${toCurrencyDisplay(inst.value)}${dateStr} — ${status}`);
  });

  lines.push("");
  lines.push(`✅ Pago: ${toCurrencyDisplay(paidTotal)}`);
  lines.push(`⏳ Pendente: ${toCurrencyDisplay(pendingTotal)}`);

  return lines.join("\n");
}

// ─── DatePickerField ──────────────────────────────────────────────────────────────
/**
 * Usa o Input customizado com isDate.
 * - Se value (timestamp) já existe: useTodayAsDefaultValue=false, abre na data salva
 * - Se não há value: useTodayAsDefaultValue=true (abre com hoje selecionado por padrão)
 * Sempre que o usuário seleciona uma data, chama onChange com o timestamp.
 */
function DatePickerField({ value, onChange, label = "Vencimento", icon = "calendar", colors }) {
  const hasDate = !!value;

  const handleDateSelected = (dateObj) => {
    const ts = dateObj instanceof Date ? dateObj.getTime() : new Date(dateObj).getTime();
    onChange(ts);
  };

  // String ISO "YYYY-MM-DD" para inicializar o calendário na data já salva
  const initialISO = hasDate
    ? new Date(value).toISOString().split("T")[0]
    : undefined;

  return (
    <Input
      background={colors.card}
      label={label}
      placeholder="Selecione a data"
      icon={icon}
      placeholderTextColor={colors.text + "66"}
      // Passa o valor como texto para o StyledTextInput (sobreposto visualmente pelo picker)
      value={hasDate ? tsToDateBR(value) : ""}
      isDate={true}
      editable={false}
      keyboardType="numeric"
      useTodayAsMin={false}
      useTodayAsDefaultValue={!hasDate}
      // ← chave da correção: inicializa o calendário interno na data salva
      initialDate={initialISO}
      setDateSelected={handleDateSelected}
    />
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function EditOrderModal({
  visible,
  order,
  clientId,
  client,
  userProducts,
  onClose,
  onSave,
  onCancelOrder,
  onDeleteOrder,
  colors,
}) {
  const [productId,         setProductId]         = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [quantity,          setQuantity]          = useState("1");
  const [installments,      setInstallments]      = useState([]);
  const [firstDueDate,      setFirstDueDate]      = useState(null);
  const [firstDateSet,      setFirstDateSet]      = useState(false);

  // ── Inicializar ao abrir ───────────────────────────────────────────────────
  useEffect(() => {
    if (!order || !visible) return;
    setProductId(order.productId || "");
    setQuantity(String(order.quantity || 1));
    setInstallments(
      (order.installments || []).map((i) => ({
        ...i,
        valueStr: formatCurrency(String(Math.round(i.value * 100))),
        // dueDate: preserva exatamente o que veio do banco (null ou timestamp)
        dueDate: i.dueDate ?? null,
      }))
    );
    const first = (order.installments || [])[0];
    // Só seta firstDueDate se a primeira parcela JÁ tem data salva
    const savedDate = first?.dueDate ?? null;
    setFirstDueDate(savedDate);
    setFirstDateSet(!!savedDate);
    setProductPickerOpen(false);
  }, [order, visible]);

  const selectedProduct = userProducts.find((p) => p.productId === productId);
  const originalProduct = userProducts.find((p) => p.productId === order?.productId);

  // ── Recalcular parcelas pendentes ──────────────────────────────────────────
  const recalcPending = useCallback(
    (instList, pid, qty) => {
      const prod = userProducts.find((p) => p.productId === pid);
      if (!prod) return instList;
      const qtyN        = parseInt(qty, 10) || 1;
      const total       = prod.price * qtyN;
      const paidTotal   = instList.filter((i) => i.paid).reduce((s, i) => s + i.value, 0);
      const pendingList = instList.filter((i) => !i.paid);
      if (pendingList.length === 0) return instList;
      const pendingValue = Math.max(0, total - paidTotal);
      const perPending   = pendingValue / pendingList.length;
      return instList.map((i) =>
        i.paid
          ? i
          : { ...i, value: perPending, valueStr: formatCurrency(String(Math.round(perPending * 100))) }
      );
    },
    [userProducts]
  );

  useEffect(() => {
    if (!visible) return;
    setInstallments((prev) => recalcPending(prev, productId, quantity));
  }, [productId, quantity, recalcPending, visible]);

  // ── Propagar data da 1ª parcela mensalmente ────────────────────────────────
  useEffect(() => {
    if (!firstDueDate || !firstDateSet) return;
    setInstallments((prev) =>
      prev.map((inst, idx) => ({ ...inst, dueDate: addMonths(firstDueDate, idx) }))
    );
  }, [firstDueDate, firstDateSet]);

  // ── Remover parcela não paga ───────────────────────────────────────────────
  const removeInstallment = (installmentId) => {
    Alert.alert("Remover parcela", "Deseja remover esta parcela? O valor total será recalculado.", [
      { text: "Voltar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setInstallments((prev) => {
            const filtered  = prev.filter((i) => i.installmentId !== installmentId);
            const reindexed = filtered.map((i, idx) => ({ ...i, index: idx + 1 }));
            return recalcPending(reindexed, productId, quantity);
          });
        },
      },
    ]);
  };

  const updateInstValue = (installmentId, rawText) => {
    const formatted = formatCurrency(rawText);
    setInstallments((prev) =>
      prev.map((i) =>
        i.installmentId === installmentId
          ? { ...i, valueStr: formatted, value: parseCurrency(formatted) }
          : i
      )
    );
  };

  const updateInstDate = (installmentId, ts) => {
    setInstallments((prev) =>
      prev.map((i) => (i.installmentId === installmentId ? { ...i, dueDate: ts } : i))
    );
  };

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    const currentOrder = {
      ...order,
      productId,
      productRef: selectedProduct?.name ?? order.productRef,
      quantity:   parseInt(quantity, 10) || order.quantity,
      totalValue: installments.reduce((s, i) => s + i.value, 0),
      installments,
    };
    const text    = buildOrderText(currentOrder, client);
    const encoded = encodeURIComponent(text);
    const url     = `whatsapp://send?text=${encoded}`;
    Linking.canOpenURL(url)
      .then((ok) => Linking.openURL(ok ? url : `https://wa.me/?text=${encoded}`))
      .catch(() => Alert.alert("Erro", "Não foi possível abrir o WhatsApp."));
  };

  // ── Salvar ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const qty = parseInt(quantity, 10);
    if (!productId)          { Alert.alert("Produto obrigatório", "Selecione um produto."); return; }
    if (!qty || qty <= 0)    { Alert.alert("Quantidade inválida", "Informe uma quantidade maior que zero."); return; }
    if (!installments.length){ Alert.alert("Sem parcelas", "O pedido precisa ter ao menos uma parcela."); return; }

    const prod        = userProducts.find((p) => p.productId === productId);
    const originalQty = order?.quantity || 0;
    const sameProduct = productId === order?.productId;
    const stockDeltas = [];

    if (sameProduct) {
      const delta    = originalQty - qty;
      const newStock = (prod?.quantity ?? 0) + delta;
      if (newStock < 0) {
        Alert.alert("Estoque insuficiente", `Disponível: ${prod.quantity + originalQty} un. de "${prod.name}".`);
        return;
      }
      stockDeltas.push({ productId, delta });
    } else {
      if (originalProduct) stockDeltas.push({ productId: originalProduct.productId, delta: +originalQty });
      const newStock = (prod?.quantity ?? 0) - qty;
      if (newStock < 0) {
        Alert.alert("Estoque insuficiente", `Disponível: ${prod.quantity} un. de "${prod.name}".`);
        return;
      }
      stockDeltas.push({ productId, delta: -qty });
    }

    onSave(
      {
        ...order,
        productId,
        productRef: prod.name,
        quantity:   qty,
        totalValue: installments.reduce((s, i) => s + i.value, 0),
        installments: installments.map((i) => ({ ...i, idx: i.index, dueDate: i.dueDate ?? null })),
      },
      stockDeltas
    );
  };

  // ── Derivados ──────────────────────────────────────────────────────────────
  const totalParcelas = installments.reduce((s, i) => s + (i.value || 0), 0);
  const pendingCount  = installments.filter((i) => !i.paid).length;
  const paidCount     = installments.filter((i) => i.paid).length;

  if (!order) return null;

  const availableProducts = userProducts.filter(
    (p) => p.quantity > 0 || p.productId === productId
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.modalBox, { backgroundColor: colors.card }]}>

          {/* ── Cabeçalho ── */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Pedido</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                onPress={handleShareWhatsApp}
                style={[styles.whatsappBtn, { backgroundColor: "#25D366" }]}
              >
                <FontAwesome6 name="whatsapp" size={16} color="#fff" />
                <Text style={styles.whatsappBtnText}>Compartilhar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ── Produto ── */}
            <Text style={[styles.label, { color: colors.text }]}>Produto *</Text>
            <TouchableOpacity
              disabled={true}
              style={[styles.productSelector, { borderColor: colors.mediumRed, backgroundColor: colors.background }]}
              onPress={() => setProductPickerOpen((v) => !v)}
            >
              <Text style={{ flex: 1, color: selectedProduct ? colors.text : colors.text + "66" }}>
                {selectedProduct ? selectedProduct.name : "Selecione um produto..."}
              </Text>
              {/* <FontAwesome6 name={productPickerOpen ? "chevron-up" : "chevron-down"} size={12} color={colors.text} /> */}
            </TouchableOpacity>

            {productPickerOpen && (
              <View style={[styles.productPicker, { borderColor: colors.mediumRed }]}>
                {availableProducts.length === 0 ? (
                  <Text style={[styles.noStockText, { color: colors.text }]}>
                    ⚠️ Nenhum produto com estoque disponível.
                  </Text>
                ) : (
                  availableProducts.map((p) => {
                    const sel            = p.productId === productId;
                    const effectiveStock = p.productId === order.productId
                      ? p.quantity + (order.quantity || 0)
                      : p.quantity;
                    return (
                      <TouchableOpacity
                        key={p.productId}
                        style={[
                          styles.productOption,
                          { borderColor: sel ? colors.mediumRed : colors.text + "22" },
                          sel && { backgroundColor: colors.mediumRed + "22" },
                        ]}
                        onPress={() => { setProductId(p.productId); setProductPickerOpen(false); }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.productOptionName, { color: colors.text }]}>{p.name}</Text>
                          <Text style={[styles.productOptionSub, { color: colors.text }]}>
                            Estoque disponível: {effectiveStock} • {toCurrencyDisplay(p.price)} cada
                          </Text>
                        </View>
                        {sel && <FontAwesome6 name="circle-check" size={18} color={colors.mediumRed} />}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* ── Quantidade ── */}
            <Input
              label="Quantidade *"
              icon="cubes"
              keyboardType="numeric"
              value={quantity}
              onChangeText={(v) => setQuantity(v.replace(/\D/g, ""))}
              returnKeyType="done"
            />

            {/* ── Resumo ── */}
            <View style={[styles.previewBox, { backgroundColor: colors.background, marginBottom: 4 }]}>
              <FontAwesome6 name="circle-info" size={13} color={colors.mediumRed} />
              <Text style={[styles.previewText, { color: colors.text, marginLeft: 6 }]}>
                Total: {toCurrencyDisplay(totalParcelas)}  •  {paidCount} paga(s)  •  {pendingCount} pendente(s)
              </Text>
            </View>

            {/* ── Data da 1ª parcela (propaga mensalmente) ── */}
            <View style={[styles.dueDateSection, { borderColor: colors.mediumRed + "33", backgroundColor: colors.card }]}>
              <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 0, marginBottom: 8 }]}>
                Datas de vencimento
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <DatePickerField
                    value={firstDueDate}
                    onChange={(ts) => { setFirstDueDate(ts); setFirstDateSet(true); }}
                    label="Data da 1ª parcela"
                    icon="calendar-days"
                    colors={colors}
                  />
                </View>
                {firstDateSet && (
                  <TouchableOpacity
                    onPress={() => {
                      setFirstDueDate(null);
                      setFirstDateSet(false);
                      setInstallments((prev) => prev.map((i) => ({ ...i, dueDate: null })));
                    }}
                  >
                    <FontAwesome6 name="xmark" size={16} color={colors.text} style={{ opacity: 0.4 }} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.hintText, { color: colors.text }]}>
                Ao definir a data da 1ª parcela, as demais serão geradas mensalmente. Ajuste individualmente abaixo se necessário.
              </Text>
            </View>

            {/* ── Lista de parcelas ── */}
            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 16 }]}>
              Parcelas ({installments.length})
            </Text>

            {installments.map((inst) => (
              <View
                key={inst.installmentId}
                style={[
                  styles.installmentEditRow,
                  {
                    backgroundColor: inst.paid ? "#d5f5e311" : colors.background,
                    borderColor:     inst.paid ? "#27ae6044" : colors.mediumRed + "33",
                  },
                ]}
              >
                {/* Cabeçalho da parcela */}
                <View style={styles.installmentEditHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.installmentEditIndex, { color: colors.mediumRed }]}>
                      #{inst.index}
                    </Text>
                    {inst.paid ? (
                      <View style={styles.paidBadge}>
                        <FontAwesome6 name="check" size={10} color="#27ae60" />
                        <Text style={styles.paidText}>Pago</Text>
                      </View>
                    ) : (
                      <View style={[styles.pendingBadge, { borderColor: colors.mediumRed + "55" }]}>
                        <Text style={[styles.pendingBadgeText, { color: colors.mediumRed }]}>Pendente</Text>
                      </View>
                    )}
                  </View>
                  {!inst.paid && (
                    <TouchableOpacity onPress={() => removeInstallment(inst.installmentId)}>
                      <FontAwesome6 name="trash" size={14} color="#c0392b" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Valor + Vencimento */}
                <View style={styles.installmentEditFields}>
                  {/* Valor */}
                  <View style={{ flex: 1 }}>
                    {inst.paid ? (
                      <>
                        <Text style={[styles.label, { color: colors.text, marginTop: 0 }]}>Valor</Text>
                        <View
                          style={[
                            styles.dateDisplayOverlay,
                            { borderColor: colors.text + "22", backgroundColor: colors.card },
                          ]}
                        >
                          <Text style={{ color: colors.text, opacity: 0.6, fontSize: 14 }}>
                            {toCurrencyDisplay(inst.value)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <Input
                        label="Valor"
                        icon="money-bill-wave"
                        keyboardType="numeric"
                        value={inst.valueStr}
                        onChangeText={(v) => updateInstValue(inst.installmentId, v)}
                        returnKeyType="done"
                      />
                    )}
                  </View>

                  {/* Vencimento */}
                  <View style={{ flex: 1 }}>
                    <DatePickerField
                      value={inst.dueDate}
                      onChange={(ts) => updateInstDate(inst.installmentId, ts)}
                      label="Vencimento"
                      icon="calendar"
                      colors={colors}
                    />
                  </View>
                </View>
              </View>
            ))}

            {installments.length === 0 && (
              <Text style={[styles.hintText, { color: colors.text, textAlign: "center", marginTop: 8 }]}>
                Nenhuma parcela. Salvar assim encerrará o pedido sem pendências.
              </Text>
            )}

            {/* ── Botões ── */}
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={onClose}
                style={[styles.modalBtn, { borderColor: colors.mediumRed }]}
                labelStyle={{ color: colors.mediumRed }}
              >
                Fechar
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.modalBtn, { backgroundColor: colors.mediumRed }]}
                labelStyle={{ color: "#fff" }}
              >
                Salvar
              </Button>
            </View>

            {/* ── Zona de perigo ── */}
            <View style={[styles.dangerZone, { borderColor: "#c0392b33" }]}>
              <Text style={[styles.dangerZoneTitle, { color: "#c0392b" }]}>Zona de perigo</Text>
              <Button
                mode="outlined"
                icon="close-circle-outline"
                style={{ borderColor: "#e67e22", borderRadius: 10 }}
                labelStyle={{ color: "#e67e22", fontSize: 12 }}
                onPress={() => onCancelOrder(clientId, order.orderId)}
              >
                Cancelar pedido (manter histórico)
              </Button>
              <Button
                mode="outlined"
                icon="trash-can-outline"
                style={{ borderColor: "#c0392b", borderRadius: 10, marginTop: 8 }}
                labelStyle={{ color: "#c0392b", fontSize: 12 }}
                onPress={() => onDeleteOrder(clientId, order.orderId)}
              >
                Excluir pedido definitivamente
              </Button>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}