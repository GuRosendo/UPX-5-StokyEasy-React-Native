import React, { useContext, useEffect, useState } from "react";
import { View, Image, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../../components/ThemeContext";
import { Button } from "react-native-paper";
import { FontAwesome6 } from '@expo/vector-icons';

import { ModalCustom } from "../../components/general/ModalCustom";
import { LoginDataContext } from '../../components/LoginDataContext';

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InitialPage({ navigation }) {
    const { theme, themeColors, toggleTheme } = useTheme();
    const colors = themeColors[theme];

    const [isEnabled, setIsEnabled] = useState();
    const [isModalVisible, setModalVisible] = useState(false);

    const { storedData, setStoredData } = useContext(LoginDataContext);

    const [fullName, setFullName] = useState("Usuário");

    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
        toggleTheme();
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    useEffect(() => {
        setIsEnabled(theme == "dark");
    }, []);

    useEffect(() => {
        AsyncStorage.getItem("userData").then((data) => {
            if (data) {
                let userParsed = JSON.parse(data);

                if (userParsed?.fullName) {
                    setFullName(userParsed.fullName.split(" ")[0]);
                }
            }
        });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.userName, { color: colors.text }]}>
                    Olá, {fullName}!
                </Text>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={toggleModal}
                >
                    <FontAwesome6
                        name="arrow-right-from-bracket"
                        color={colors.mediumRed}
                        size={24}
                    />
                </TouchableOpacity>
            </View>

            <Image
                source={""}
                style={styles.avatar}
                resizeMode="contain"
            />

            <View style={styles.titleContainer}>
                <FontAwesome6 name="boxes-stacked" size={32} color={colors.mediumRed} style={styles.logo} />
                <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
                    StokyEasy!
                </Text>
            </View>

            <Text style={[styles.subtitle, { color: colors.text }]}>
                Acompanhe seus produtos, pedidos e clientes em um só lugar, de forma fácil e rápida.
            </Text>

            <Button
                mode="contained"
                style={[styles.button, { backgroundColor: colors.mediumRed }]}
                onPress={() => navigation.navigate("Produtos")}
                labelStyle={{ color: '#fff' }}
            >
                Produtos
            </Button>

            <Button
                mode="outlined"
                style={[styles.button, { borderColor: colors.mediumRed }]}
                onPress={() => navigation.navigate("Clientes")}
                labelStyle={{ color: colors.mediumRed }}
            >
                Clientes
            </Button>

            <Button
                style={[styles.button]}
                onPress={() => navigation.navigate("Perfil")}
                labelStyle={{ color: colors.mediumRed }}
            >
                Perfil
            </Button>

            <View style={styles.switchContainer}>
                <FontAwesome6
                    name={isEnabled ? "moon" : "sun"}
                    size={20}
                    color={colors.mediumRed}
                    style={styles.switchIcon}
                />
                <Text style={[styles.switchText, { color: colors.text }]}>
                    {isEnabled ? "Modo Escuro" : "Modo Claro"}
                </Text>
                <Switch
                    trackColor={{ false: "#767577", true: colors.mediumRedOpaque }}
                    thumbColor={isEnabled ? colors.mediumRed : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                    style={styles.switch}
                />
            </View>

            <ModalCustom
                isModalVisible={isModalVisible}
                toggleModal={toggleModal}
                setStoredData={setStoredData}
                storedData={storedData}
                isExit={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 25,
        justifyContent: "center"
    },
    header: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 8,
    },
    avatar: {
        width: 180,
        height: 180,
        marginBottom: 15
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 10,
    },
    logo: {
        marginBottom: 5,
    },
    title: {
        textAlign: "center",
    },
    subtitle: {
        textAlign: "center",
        opacity: 0.7,
        marginBottom: 30,
        fontSize: 16,
    },
    button: {
        width: "80%",
        marginTop: 12,
        borderRadius: 14,
        paddingVertical: 6,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        padding: 15,
        borderRadius: 12,
        backgroundColor: "rgba(122, 29, 41, 0.1)",
        gap: 10,
    },
    switchIcon: {
        marginRight: 5,
    },
    switchText: {
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
    },
    switch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
});