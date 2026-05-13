import { View, FlatList, TouchableOpacity, TextInput } from "react-native";
import { Text } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "../../../components/ThemeContext";
import { useProducts } from "./useProducts";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { styles } from "./products.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context"; 

export default function ProductsScreen() {
  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets(); 

  const {
    products,
    allProducts,
    modalVisible,
    editingProduct,
    form,
    setForm,
    expandedId,
    totalStock,
    totalValue,
    searchQuery,
    setSearchQuery,
    searchVisible,
    toggleSearch,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    toggleExpand,
  } = useProducts();

  const ListHeader = (
    <>
      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        Produtos
      </Text>

      {/* Resumo */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <FontAwesome6 name="boxes-stacked" size={20} color={colors.mediumRed} />
          <Text style={[styles.summaryValue, { color: colors.text }]}>{allProducts.length}</Text>
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

      {/* Barra de busca */}
      {searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.mediumRed }]}>
          <FontAwesome6 name="magnifying-glass" size={14} color={colors.text} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nome, categoria..."
            placeholderTextColor={colors.text + "66"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <FontAwesome6 name="xmark" size={14} color={colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <FontAwesome6 name="box-open" size={48} color={colors.mediumRed} style={{ opacity: 0.4 }} />
      <Text style={[styles.empty, { color: colors.text }]}>
        {searchQuery ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.container}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={<View style={{ height: 100 }} />}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isExpanded={expandedId === item.productId}
            onToggle={toggleExpand}
            onEdit={openEditModal}
            onDelete={handleDelete}
            colors={colors}
          />
        )}
      />

      {/* FABs */}
      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[
            styles.fabSecondary,
            { backgroundColor: searchVisible ? colors.mediumRed : colors.card },
          ]}
          onPress={toggleSearch}
          activeOpacity={0.85}
        >
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color={searchVisible ? "#fff" : colors.mediumRed}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.mediumRed }]}
          onPress={openCreateModal}
          activeOpacity={0.85}
        >
          <FontAwesome6 name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

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
