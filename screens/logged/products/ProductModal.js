import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { formatCurrency } from "../shared/helpers";
import { PRODUCT_CATEGORIES } from "./useProducts";
import { Input } from "../../../components/general/Input";
import { ConfirmModal } from "../../../components/general/ConfirmModal";
import { styles } from "./products.styles";
import { ToastPortal } from "../../../components/general/ToastPortal";
import { useTheme } from "../../../components/ThemeContext";

export function ProductModal({ visible, editingProduct, form, setForm, onSave, onClose, colors }) {
  const [sourceModal, setSourceModal] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  // Oculta o modal enquanto o picker do sistema está aberto
  const [picking, setPicking] = useState(false);
  const { theme } = useTheme();

  const handlePickCamera = async () => {
    setSourceModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === "granted") {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false, // ← tira o crop da câmera
          quality: 0.7,
        });
        if (!result.canceled && result.assets?.length > 0) {
          setForm((f) => ({ ...f, imageUri: result.assets[0].uri }));
        }
      }
    } catch (e) {}
  };

  const handlePickGallery = async () => {
    setSourceModal(false);
    setPicking(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status === "granted") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaType.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
        if (!result.canceled && result.assets?.length > 0) {
          setForm((f) => ({ ...f, imageUri: result.assets[0].uri }));
        }
      }
    } finally {
      setPicking(false);
    }
  };

  const handleRemoveConfirmed = () => {
    setRemoveModal(false);
    setForm((f) => ({ ...f, imageUri: "" }));
  };

  // Modal fica invisível (mas montado) enquanto o picker do sistema está ativo
  const modalVisible = visible;

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={[styles.modalOverlay, picking && { backgroundColor: "transparent" }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

          <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
            {/* Cabeçalho */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome6 name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Foto do produto */}
              <Text style={[styles.label, { color: colors.text, marginTop: 0 }]}>Foto</Text>
              <View style={styles.imagePickerRow}>
                <TouchableOpacity
                  onPress={() => (form.imageUri ? setRemoveModal(true) : setSourceModal(true))}
                  activeOpacity={0.8}
                  style={[
                    styles.imagePicker,
                    {
                      backgroundColor: colors.card,
                      borderColor: form.imageUri ? colors.mediumRed : colors.text + "33",
                    },
                  ]}
                >
                  {form.imageUri ? (
                    <Image
                      source={{ uri: form.imageUri }}
                      style={styles.imagePickerPreview}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <FontAwesome6 name="camera" size={22} color={colors.mediumRed} />
                      <Text style={[styles.imagePickerText, { color: colors.text }]}>
                        Adicionar foto
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {form.imageUri && (
                  <View style={styles.imagePickerActions}>
                    <TouchableOpacity
                      onPress={() => setSourceModal(true)}
                      style={[styles.imageActionBtn, { backgroundColor: colors.mediumRedOpaque }]}
                      activeOpacity={0.8}
                    >
                      <FontAwesome6 name="pen" size={13} color={colors.mediumRed} />
                      <Text style={[styles.imageActionText, { color: colors.mediumRed }]}>
                        Trocar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setRemoveModal(true)}
                      style={[styles.imageActionBtn, { backgroundColor: colors.card }]}
                      activeOpacity={0.8}
                    >
                      <FontAwesome6 name="trash" size={13} color={colors.text} style={{ opacity: 0.6 }} />
                      <Text style={[styles.imageActionText, { color: colors.text, opacity: 0.6 }]}>
                        Remover
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Nome */}
              <Input
                label="Nome *"
                icon="box"
                placeholder="Ex: Camiseta Básica"
                background={colors.card}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                returnKeyType="next"
              />

              {/* Categoria */}
              <Text style={[styles.label, { color: colors.text }]}>Categoria *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 4 }}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                {PRODUCT_CATEGORIES.map((cat) => {
                  const selected = form.category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setForm({ ...form, category: cat })}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: selected ? colors.mediumRed : colors.background,
                          borderColor: selected ? colors.mediumRed : colors.text + "33",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: selected ? "#fff" : colors.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Quantidade + Valor */}
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Quantidade *"
                    icon="cubes"
                    placeholder="0"
                    keyboardType="numeric"
                    background={colors.card}
                    value={form.quantity}
                    onChangeText={(v) => setForm({ ...form, quantity: v.replace(/\D/g, "") })}
                    returnKeyType="next"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Input
                    label="Valor (R$) *"
                    icon="money-bill-wave"
                    placeholder="0,00"
                    keyboardType="numeric"
                    background={colors.card}
                    value={form.price}
                    onChangeText={(v) => setForm({ ...form, price: formatCurrency(v) })}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Descrição */}
              <Input
                label="Descrição"
                icon="align-left"
                placeholder="Detalhes adicionais do produto..."
                background={colors.card}
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                multiline={true}
                returnKeyType="done"
              />

              {/* Botões */}
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
                  {editingProduct ? "Salvar" : "Cadastrar"}
                </Button>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        <ToastPortal theme={theme} />
      </Modal>

      {/* Modal: escolher origem da foto */}
      <Modal
        visible={sourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSourceModal(false)}
      >
        <TouchableOpacity
          style={styles.sourceOverlay}
          activeOpacity={1}
          onPress={() => setSourceModal(false)}
        >
          <View style={[styles.sourceBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.sourceTitle, { color: colors.text }]}>Foto do produto</Text>
            <Text style={[styles.sourceSubtitle, { color: colors.text }]}>
              Como deseja adicionar a foto?
            </Text>

            <TouchableOpacity
              style={[styles.sourceBtn, { backgroundColor: colors.mediumRedOpaque }]}
              onPress={handlePickCamera}
              activeOpacity={0.8}
            >
              <FontAwesome6 name="camera" size={16} color={colors.mediumRed} />
              <Text style={[styles.sourceBtnText, { color: colors.mediumRed }]}>Câmera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sourceBtn, { backgroundColor: colors.card }]}
              onPress={handlePickGallery}
              activeOpacity={0.8}
            >
              <FontAwesome6 name="images" size={16} color={colors.text} />
              <Text style={[styles.sourceBtnText, { color: colors.text }]}>Galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSourceModal(false)} style={styles.sourceCancelBtn}>
              <Text style={[styles.sourceCancelText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: confirmar remoção da foto */}
      <ConfirmModal
        visible={removeModal}
        title="Remover foto"
        message="Deseja remover a foto deste produto?"
        confirmText="Remover"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={handleRemoveConfirmed}
        onClose={() => setRemoveModal(false)}
      />
    </>
  );
}