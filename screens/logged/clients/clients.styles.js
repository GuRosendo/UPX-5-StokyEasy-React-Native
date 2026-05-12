import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen:    { flex: 1 },
  container: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  title:     { textAlign: "center", marginBottom: 20, fontWeight: "600" },

  // ── Resumo ─────────────────────────────────────────────────────────────────
  summaryRow:   { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard:  { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, elevation: 2, gap: 4 },
  summaryValue: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  summaryLabel: { fontSize: 10, opacity: 0.6, textAlign: "center" },

  // ── Busca ──────────────────────────────────────────────────────────────────
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },

  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  empty:          { textAlign: "center", opacity: 0.5, fontSize: 15 },

  // ── Card cliente ───────────────────────────────────────────────────────────
  card:            { marginBottom: 12, borderRadius: 16, elevation: 1 },
  iconContainer:   { padding: 10, borderRadius: 12 },
  expandedContent: { paddingTop: 4, paddingBottom: 8, gap: 6 },
  infoText:        { fontSize: 14, opacity: 0.75, marginBottom: 2 },

  actionRow:    { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  actionButton: { flex: 1, borderRadius: 10, minWidth: 80 },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginTop: 14, marginBottom: 6, opacity: 0.8 },

  // ── Pedido ativo ───────────────────────────────────────────────────────────
  orderCard:     { borderRadius: 12, padding: 12, marginBottom: 8 },
  orderHeader:   { flexDirection: "row", alignItems: "center", gap: 8 },
  orderTitle:    { fontSize: 14, fontWeight: "600" },
  orderSubtitle: { fontSize: 12, opacity: 0.6, marginTop: 2 },

  // ── Pedido cancelado ───────────────────────────────────────────────────────
  cancelledOrderCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  cancelledActions: {
    flexDirection: "column",
    gap: 6,
    flexShrink: 0,
  },
  cancelledActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelledActionText: { fontSize: 11, fontWeight: "600" },

  // ── Parcelas ───────────────────────────────────────────────────────────────
  installmentList:  { marginTop: 10, gap: 8 },
  installmentRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 2 },
  installmentText:  { fontSize: 13 },
  installmentDate:  { fontSize: 11, opacity: 0.6, marginTop: 1 },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d5f5e3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paidText:      { color: "#27ae60", fontSize: 12, fontWeight: "600" },
  payButton:     { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  payButtonText: { fontSize: 12, fontWeight: "600" },

  // ── FABs ───────────────────────────────────────────────────────────────────
  fabRow: {
    position: "absolute",
    bottom: 28,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fab: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
    elevation: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 4,
  },
  fabSecondary: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
    elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },

  // ── Modal base ─────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  modalBox: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
    elevation: 10, maxHeight: "94%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  },
  modalTitle:   { fontSize: 20, fontWeight: "700" },
  label:        { fontSize: 13, fontWeight: "600", marginBottom: 4, marginTop: 10, opacity: 0.8 },
  input:        { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  modalBtn:     { flex: 1, borderRadius: 12 },

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  whatsappBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // ── Modal de pedido (OrderModal) ───────────────────────────────────────────
  previewBox:  { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, marginTop: 10 },
  previewText: { fontSize: 13, fontWeight: "600", flexShrink: 1 },

  productSelector: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  productPicker:     { maxHeight: 160, borderWidth: 1.5, borderRadius: 10, marginTop: 4, padding: 4 },
  productOption:     { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1.5, marginBottom: 6 },
  productOptionName: { fontSize: 14, fontWeight: "600" },
  productOptionSub:  { fontSize: 12, opacity: 0.6, marginTop: 1 },
  noStockText:       { padding: 10, opacity: 0.6, fontSize: 13, textAlign: "center" },

  orderItemBlock:  { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  orderItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  orderItemTitle:  { fontSize: 13, fontWeight: "700" },

  addItemBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, marginBottom: 4,
  },
  addItemBtnText: { fontSize: 14, fontWeight: "600" },
  row:            { flexDirection: "row" },

  // ── EditOrderModal ─────────────────────────────────────────────────────────
  dueDateSection: {
    borderWidth: 1, borderRadius: 12,
    padding: 12, marginTop: 12, marginBottom: 4,
  },
  hintText: { fontSize: 11, opacity: 0.55, marginTop: 6 },

  installmentEditRow: {
    borderWidth: 1, borderRadius: 12,
    padding: 12, marginBottom: 10,
  },
  installmentEditHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  installmentEditIndex:  { fontSize: 14, fontWeight: "700" },
  installmentEditFields: { flexDirection: "row", gap: 10 },

  pendingBadge: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  pendingBadgeText: { fontSize: 11, fontWeight: "600" },

  dangerZone: {
    borderWidth: 1, borderRadius: 14,
    padding: 14, marginTop: 8, marginBottom: 16,
  },
  dangerZoneTitle: {
    fontSize: 12, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
  },

  // Campo de data — exibe a data em BR por cima do ISO interno do DateTimePickerCustom
  dateDisplayOverlay: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    minHeight: 46,
  },
});