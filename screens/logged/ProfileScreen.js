import { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, Button } from "react-native-paper";
import { useTheme } from '../../components/ThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';

import { formatWeight, formatHeight, formatCellphone } from '../../functions/general/Masks';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const { theme, themeColors } = useTheme();
  const colors = themeColors[theme];

  useEffect(() => {
    AsyncStorage.getItem("userData").then((data) => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    let year = date.getFullYear();
    if (year < 1000) {
      const parts = dateString.split(" ")[0].split("-");
      year = parts[0].padStart(4, "0");
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }

    return date.toLocaleDateString("pt-BR");
  };

  const updateField = async (field, value) => {
    try {
      const updatedUser = { ...user, [field]: value };
      setUser(updatedUser);

      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      const usersListJson = await AsyncStorage.getItem("users");
      if (usersListJson) {
        const usersList = JSON.parse(usersListJson);
        const index = usersList.findIndex(u => u.id === updatedUser.id);

        if (index !== -1) {
          usersList[index] = updatedUser;
          await AsyncStorage.setItem("users", JSON.stringify(usersList));
        }
      }

    } catch (error) {
      console.log("Erro ao atualizar campo:", error);
    }
  };

  const openEditor = (field, currentValue) => {
    setEditingField(field);

    let formatted = "";
    
    if (field === "weight") {
      formatted = formatWeight(currentValue, true);
    } else if (field === "height") {
      formatted = formatHeight(currentValue, true);
    } else {
      formatted = currentValue ? currentValue.toString() : "";
    }

    setInputValue(formatted);
    setModalVisible(true);
  };

  const handleInputChange = (text) => {
    let formatted = text;

    if (editingField === "weight") {
      formatted = formatWeight(text, true); 
    } else if (editingField === "height") {
      formatted = formatHeight(text, true); 
    }

    setInputValue(formatted);
  };

  const confirmEdit = () => {
    if (!editingField) return;

    updateField(editingField, inputValue);
    setModalVisible(false);
  };

  if (!user)
    return <Text style={[styles.loading, { color: colors.text }]}>Carregando perfil...</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Editar {editingField === "weight" ? "Peso" : "Altura"}
            </Text>

            <TextInput
              value={inputValue}
              onChangeText={handleInputChange}
              style={[styles.input, { borderColor: colors.mediumRed, color: colors.text }]}
              keyboardType="numeric"
            />

            <Button
              mode="contained"
              onPress={confirmEdit}
              style={{ backgroundColor: colors.mediumRed, marginTop: 10 }}
            >
              Salvar
            </Button>

            <Button onPress={() => setModalVisible(false)} style={{ marginTop: 5  }}>
              <Text style={{color: colors.text}}>Cancelar</Text>
            </Button>
          </View>
        </View>
      </Modal>

      {/* <Image
        source={require("../../assets/images/WalkingWoman.png")}
        style={styles.avatar}
        resizeMode="contain"
      /> */}

      <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
        {user.fullName}
      </Text>

      <View style={[styles.box, { backgroundColor: colors.card }]}>

        <Text style={[styles.text, { color: colors.text }]}>
          <FontAwesome6 name="envelope" size={16} color={colors.mediumRed} /> Email: {user.email}
        </Text>

        <Text style={[styles.text, { color: colors.text }]}>
          <FontAwesome6 name="phone" size={16} color={colors.mediumRed} /> Telefone: {formatCellphone(user.phone, true)}
        </Text>

        <Text style={[styles.text, { color: colors.text }]}>
          <FontAwesome6 name="cake-candles" size={16} color={colors.mediumRed} /> Nascimento: {formatDate(user.birthDate)}
        </Text>

        <Text style={[styles.text, { color: colors.text }]}>
          <FontAwesome6 name="venus-mars" size={16} color={colors.mediumRed} /> Sexo: {user.gender}
        </Text>

        <TouchableOpacity onPress={() => openEditor("weight", user.weight)}>
          <Text style={[styles.text, { color: colors.text }]}>
            <FontAwesome6 name="weight-scale" size={16} color={colors.mediumRed} /> Peso: {formatWeight(user.weight, true)} kg
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openEditor("height", user.height)}>
          <Text style={[styles.text, { color: colors.text }]}>
            <FontAwesome6 name="ruler" size={16} color={colors.mediumRed} /> Altura: {user.height} cm
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, flex: 1 },
  loading: { padding: 20, textAlign: 'center', flex: 1 },
  avatar: { width: 180, height: 180, marginBottom: 15 },
  title: { marginBottom: 25, textAlign: 'center' },
  box: {
    width: "100%",
    padding: 18,
    borderRadius: 16,
    elevation: 4,
    gap: 12
  },
  text: { fontSize: 16 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000090"
  },
  modalBox: {
    width: "85%",
    padding: 20,
    borderRadius: 14,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 16
  }
});
