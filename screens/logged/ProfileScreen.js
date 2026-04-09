import { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native-paper";
import { useTheme } from '../../components/ThemeContext';
import { FontAwesome6 } from '@expo/vector-icons';

import { formatCellphone } from '../../functions/general/Masks';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

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

  if (!user)
    return <Text style={[styles.loading, { color: colors.text }]}>Carregando perfil...</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

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
