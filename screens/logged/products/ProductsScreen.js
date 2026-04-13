import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../../components/ThemeContext";
import { useProducts } from "./useProducts";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { styles } from "./products.styles";

export default function ProductsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  const {
    products,
    modalVisible,
    editingProduct,
    form,
    setForm,
    expandedId,
    totalStock,
    totalValue,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    toggleExpand,
  } = useProducts();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
          Produtos
        </Text>

        {/* Resumo */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="boxes-stacked" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{products.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Produtos</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="cubes" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalStock}</Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Em estoque</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <FontAwesome6 name="sack-dollar" size={20} color={colors.mediumRed} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              R$ {totalValue.toFixed(2).replace(".", ",")}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>Valor total</Text>
          </View>
        </View>

        {/* Lista */}
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="box-open" size={48} color={colors.mediumRed} style={{ opacity: 0.4 }} />
            <Text style={[styles.empty, { color: colors.text }]}>
              Nenhum produto cadastrado ainda.
            </Text>
          </View>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              isExpanded={expandedId === product.productId}
              onToggle={toggleExpand}
              onEdit={openEditModal}
              onDelete={handleDelete}
              colors={colors}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.mediumRed }]}
        onPress={openCreateModal}
        activeOpacity={0.85}
      >
        <FontAwesome6 name="plus" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <ProductModal
        visible={modalVisible}
        editingProduct={editingProduct}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        onClose={closeModal}
        colors={colors}
      />
    </View>
  );
}
