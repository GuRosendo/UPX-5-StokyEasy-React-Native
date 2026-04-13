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

  emptyContainer: { alignItems: "center", marginTop: 60, gap: 12 },
  empty: { textAlign: "center", opacity: 0.5, fontSize: 15 },

  card: { marginBottom: 12, borderRadius: 16, elevation: 1 },
  iconContainer: { padding: 10, borderRadius: 12 },
  expandedContent: { paddingTop: 4, paddingBottom: 8, gap: 6 },
  descriptionText: { fontSize: 14, opacity: 0.8, marginBottom: 4 },
  detailText: { fontSize: 13, opacity: 0.7 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 10 },

  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "#00000090", justifyContent: "flex-end" },
  keyboardAvoidingModal: { width: "100%" },
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
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textArea: { height: 80, paddingTop: 10 },
  row: { flexDirection: "row" },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 8 },
  modalBtn: { flex: 1, borderRadius: 12 },
});
