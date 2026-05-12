/**
 * ProductPickerModal
 *
 * Modal independente para selecionar um produto dentro de um item de pedido.
 * Usa o componente Input/Dropdown customizado do projeto — sem ScrollView aninhada
 * dentro de FlatList, eliminando o conflito de scroll.
 *
 * Props:
 *  visible        {boolean}
 *  products       {Array}   — lista de produtos com estoque > 0
 *  selectedId     {string}  — productId já selecionado (para marcar no dropdown)
 *  onSelect       {fn}      — cb(productId) chamado ao confirmar
 *  onClose        {fn}
 *  colors         {object}  — themeColors do projeto
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { FontAwesome6 } from "@expo/vector-icons";
import { Input } from "../../../components/general/Input";
import { toCurrencyDisplay } from "../shared/helpers";
import { styles } from "./clients.styles";

export function ProductPickerModal({ visible, products, selectedId, onSelect, onClose, colors }) {
  const [search, setSearch]         = useState("");
  const [chosen, setChosen]         = useState(selectedId || null);
  const [loading, setLoading]       = useState(false);

  // Reseta estado ao abrir
  useEffect(() => {
    if (visible) {
      setChosen(selectedId || null);
      setSearch("");
      setLoading(false);
    }
  }, [visible, selectedId]);

  // Simula pequeno loading ao digitar para UX mais suave em listas grandes
  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 120);
    return () => clearTimeout(t);
  }, [search, visible]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    );
  }, [search, products]);

  const handleConfirm = () => {
    if (!chosen) return;
    onSelect(chosen);
    onClose();
  };

  const renderProduct = ({ item: p }) => {
    const selected = p.productId === chosen;
    return (
      <TouchableOpacity
        style={[
          styles.productOption,
          { borderColor: selected ? colors.mediumRed : colors.text + "22" },
          selected && { backgroundColor: colors.mediumRed + "22" },
        ]}
        onPress={() => setChosen(p.productId)}
        activeOpacity={0.75}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.productOptionName, { color: colors.text }]}>{p.name}</Text>
          <Text style={[styles.productOptionSub, { color: colors.text }]}>
            Estoque: {p.quantity} • {toCurrencyDisplay(p.price)} cada
          </Text>
        </View>
        {selected && (
          <FontAwesome6 name="circle-check" size={20} color={colors.mediumRed} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {/* Backdrop — toca para fechar */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.modalBox,
            { backgroundColor: colors.background, maxHeight: "70%" },
          ]}
        >
          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Selecionar Produto
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Campo de busca usando Input customizado */}
          <Input
            label="Buscar produto"
            icon="magnifying-glass"
            placeholder="Nome ou valor..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoFocus={false}
            background={colors.card}
          />

          {/* Lista de produtos */}
          {products.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: 24 }]}>
              <FontAwesome6
                name="box-open"
                size={36}
                color={colors.mediumRed}
                style={{ opacity: 0.35 }}
              />
              <Text style={[styles.empty, { color: colors.text }]}>
                Nenhum produto com estoque disponível.
              </Text>
            </View>
          ) : loading ? (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <ActivityIndicator size="small" color={colors.mediumRed} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: 16 }]}>
              <Text style={[styles.empty, { color: colors.text }]}>
                Nenhum produto encontrado para "{search}".
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(p) => p.productId}
              renderItem={renderProduct}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 8, gap: 6 }}
            />
          )}

          {/* Botões */}
          <View style={[styles.modalButtons, { marginTop: 12 }]}>
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
              onPress={handleConfirm}
              disabled={!chosen}
              style={[
                styles.modalBtn,
                { backgroundColor: chosen ? colors.mediumRed : colors.text + "33" },
              ]}
              labelStyle={{ color: "#fff" }}
            >
              Confirmar
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}