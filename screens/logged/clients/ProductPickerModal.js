/**
 * ProductPickerModal
 *
 * Modal independente para selecionar um produto dentro de um item de pedido.
 * Paginação de 30 itens por página com busca via banco (LIMIT/OFFSET no SQLite).
 *
 * Props:
 *  visible        {boolean}
 *  userId         {string}  — id do usuário para consulta paginada
 *  selectedId     {string}  — productId já selecionado (para marcar no dropdown)
 *  onSelect       {fn}      — cb(productId) chamado ao confirmar
 *  onClose        {fn}
 *  colors         {object}  — themeColors do projeto
 *
 * Nota: a prop `products` ainda é aceita por compatibilidade mas não é usada
 * internamente — a busca e paginação são feitas direto no banco.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { Pagination } from "../../../components/general/Pagination";
import { toCurrencyDisplay } from "../shared/helpers";
import { getAvailableProductsPaged } from "../shared/database";
import { getSession } from "../../../functions/shared/secureStorage";
import { styles } from "./clients.styles";

const PAGE_SIZE = 30;

export function ProductPickerModal({ visible, selectedId, onSelect, onClose, colors }) {
  const [search,      setSearch]      = useState("");
  const [chosen,      setChosen]      = useState(selectedId || null);
  const [loading,     setLoading]     = useState(false);

  // Dados paginados
  const [items,       setItems]       = useState([]);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);

  const searchTimer = useRef(null);
  const userIdRef   = useRef(null);

  // Busca o userId uma vez e guarda na ref
  useEffect(() => {
    getSession().then((u) => { if (u) userIdRef.current = u.id; });
  }, []);

  // Reseta estado ao abrir
  useEffect(() => {
    if (visible) {
      setChosen(selectedId || null);
      setSearch("");
      setPage(1);
      fetchPage(1, "");
    }
  }, [visible, selectedId]);

  const fetchPage = async (targetPage, query) => {
    const userId = userIdRef.current;
    if (!userId) {
      // Tenta buscar sessão na hora (caso não tenha carregado ainda)
      const u = await getSession();
      if (!u) return;
      userIdRef.current = u.id;
    }
    setLoading(true);
    try {
      const { items: rows, total, totalPages: tp } = getAvailableProductsPaged(
        userIdRef.current, targetPage, query
      );
      setItems(rows);
      setPage(targetPage);
      setTotalItems(total);
      setTotalPages(tp);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchPage(1, text);
    }, 300);
  };

  const goNext = () => fetchPage(Math.min(page + 1, totalPages), search);
  const goPrev = () => fetchPage(Math.max(page - 1, 1), search);

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

  const ListFooter = (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={PAGE_SIZE}
      onNext={goNext}
      onPrev={goPrev}
      colors={colors}
    />
  );

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
            { backgroundColor: colors.background, maxHeight: "75%" },
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

          {/* Campo de busca */}
          <Input
            label="Buscar produto"
            icon="magnifying-glass"
            placeholder="Nome ou categoria..."
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoFocus={false}
            background={colors.card}
          />

          {/* Lista de produtos */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 28 }}>
              <ActivityIndicator size="small" color={colors.mediumRed} />
            </View>
          ) : totalItems === 0 && !search ? (
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
          ) : items.length === 0 ? (
            <View style={[styles.emptyContainer, { marginTop: 16 }]}>
              <Text style={[styles.empty, { color: colors.text }]}>
                Nenhum produto encontrado para "{search}".
              </Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(p) => p.productId}
              renderItem={renderProduct}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 4, gap: 6 }}
              ListFooterComponent={ListFooter}
            />
          )}

          {/* Botões */}
          <View style={[styles.modalButtons, { marginTop: 12, paddingBottom: 16 }]}>
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