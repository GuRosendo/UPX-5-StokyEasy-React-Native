import { View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";

/**
 * Componente de paginação reutilizável.
 *
 * Props:
 *  page         {number}   — página atual (1-based)
 *  totalPages   {number}
 *  onPrev       {fn}
 *  onNext       {fn}
 *  colors       {object}
 *  totalItems   {number}   — total de itens (opcional, para exibir "X resultados")
 *  pageSize     {number}   — itens por página (opcional)
 */
export function Pagination({ page, totalPages, onPrev, onNext, colors, totalItems, pageSize = 30 }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems ?? page * pageSize);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginTop: 4,
      }}
    >
      {/* Anterior */}
      <TouchableOpacity
        onPress={onPrev}
        disabled={page <= 1}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: page <= 1 ? colors.card + "60" : colors.mediumRedOpaque,
          opacity: page <= 1 ? 0.4 : 1,
        }}
      >
        <FontAwesome6 name="chevron-left" size={12} color={colors.mediumRed} />
        <Text style={{ color: colors.mediumRed, fontSize: 13, fontWeight: "600" }}>Anterior</Text>
      </TouchableOpacity>

      {/* Info da página */}
      <View style={{ alignItems: "center", gap: 2 }}>
        <Text style={{ color: colors.text, fontSize: 13, fontWeight: "700" }}>
          {page} / {totalPages}
        </Text>
        {totalItems != null && (
          <Text style={{ color: colors.text, fontSize: 11, opacity: 0.5 }}>
            {from}–{to} de {totalItems}
          </Text>
        )}
      </View>

      {/* Próxima */}
      <TouchableOpacity
        onPress={onNext}
        disabled={page >= totalPages}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: page >= totalPages ? colors.card + "60" : colors.mediumRedOpaque,
          opacity: page >= totalPages ? 0.4 : 1,
        }}
      >
        <Text style={{ color: colors.mediumRed, fontSize: 13, fontWeight: "600" }}>Próxima</Text>
        <FontAwesome6 name="chevron-right" size={12} color={colors.mediumRed} />
      </TouchableOpacity>
    </View>
  );
}