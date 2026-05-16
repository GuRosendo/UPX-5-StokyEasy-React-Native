import { View, TouchableOpacity, Image } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { styles } from "./products.styles";

export function ProductCard({ product, isExpanded, onToggle, onEdit, onDelete, colors }) {
  return (
    <View>
      <Card style={[styles.card, { backgroundColor: colors.card }]} mode="elevated">
        {/* Apenas o header é clicável para expandir/colapsar */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => onToggle(product.productId)}>
          <Card.Title
            title={product.name}
            subtitle={`Qtd: ${product.quantity}  •  R$ ${product.price.toFixed(2).replace(".", ",")}`}
            titleStyle={{ fontSize: 17, fontWeight: "600", color: colors.text }}
            subtitleStyle={{ opacity: 0.7, color: colors.text }}
            left={() =>
              product.imageUri ? (
                <Image
                  source={{ uri: product.imageUri }}
                  style={styles.cardThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: colors.mediumRedOpaque }]}>
                  <FontAwesome6 name="box" size={18} color={colors.mediumRed} />
                </View>
              )
            }
            right={() => (
              <FontAwesome6
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.text}
                style={{ marginRight: 16, opacity: 0.5 }}
              />
            )}
          />
        </TouchableOpacity>

        {isExpanded && (
          <Card.Content style={styles.expandedContent}>
            {/* Imagem expandida */}
            {/* {product.imageUri && (
              <Image
                source={{ uri: product.imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )} */}

            {/* Badge de categoria */}
            {product.category ? (
              <View style={[styles.categoryBadge, { backgroundColor: colors.mediumRedOpaque }]}>
                <FontAwesome6 name="tag" size={11} color={colors.mediumRed} />
                <Text style={[styles.categoryBadgeText, { color: colors.mediumRed }]}>
                  {product.category}
                </Text>
              </View>
            ) : null}

            {product.description ? (
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                <FontAwesome6 name="align-left" size={14} color={colors.mediumRed} />{" "}
                {product.description}
              </Text>
            ) : null}

            <Text style={[styles.detailText, { color: colors.text }]}>
              <FontAwesome6 name="calendar" size={14} color={colors.mediumRed} />{" "}
              Cadastrado em: {new Date(product.createdAt).toLocaleDateString("pt-BR")}
            </Text>

            <View style={styles.actionRow}>
              <Button
                mode="contained"
                onPress={() => onEdit(product)}
                style={[styles.actionButton, { backgroundColor: colors.mediumRed }]}
                labelStyle={{ color: "#fff", fontSize: 13 }}
                icon="pencil"
              >
                Editar
              </Button>
              <Button
                mode="outlined"
                onPress={() => onDelete(product)}
                style={[styles.actionButton, { borderColor: colors.mediumRed }]}
                labelStyle={{ color: colors.mediumRed, fontSize: 13 }}
                icon="trash-can-outline"
              >
                Excluir
              </Button>
            </View>
          </Card.Content>
        )}
      </Card>
    </View>
  );
}