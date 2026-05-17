import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "600" },

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    elevation: 2,
    gap: 4,
  },
  summaryValue: { fontSize: 15, fontWeight: "700" },
  summaryLabel: { fontSize: 11, opacity: 0.6 },

  // Busca
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
  empty: { textAlign: "center", opacity: 0.5, fontSize: 15 },

  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  iconContainer: { padding: 10, borderRadius: 12 },

  // Thumbnail no header do card
  cardThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },

  // Imagem expandida no card
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },

  expandedContent: { paddingTop: 4, paddingBottom: 8, gap: 6 },
  descriptionText: { fontSize: 14, opacity: 0.8, marginBottom: 4 },
  detailText: { fontSize: 13, opacity: 0.7 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 10 },

  // Badge de categoria no card
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  categoryBadgeText: { fontSize: 12, fontWeight: "600" },

  // Chips de categoria no modal
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  categoryChipText: { fontSize: 13, fontWeight: "500" },

  // FABs
  fabRow: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 16,   // ← reduzido
    pointerEvents: "box-none", // ← deixa cliques passarem pela área transparente
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabSecondary: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // Modal principal
  modalOverlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  modalBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    elevation: 10,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 4, marginTop: 10, opacity: 0.8 },
  row: { flexDirection: "row" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  modalBtn: { flex: 1, borderRadius: 12 },

  // Seletor de imagem no modal
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  imagePicker: {
    width: 90,
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerPreview: {
    width: 90,
    height: 90,
  },
  imagePickerPlaceholder: {
    alignItems: "center",
    gap: 6,
  },
  imagePickerText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.7,
  },
  imagePickerActions: {
    flex: 1,
    gap: 8,
  },
  imageActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Modal de escolha de origem da foto (câmera / galeria)
  sourceOverlay: {
    flex: 1,
    backgroundColor: "#00000070",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sourceBox: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    gap: 10,
    elevation: 10,
  },
  sourceTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  sourceSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 6,
  },
  sourceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  sourceBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  sourceCancelBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 2,
  },
  sourceCancelText: {
    fontSize: 14,
    opacity: 0.45,
  },
});