import { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { useTheme } from "../../components/ThemeContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatCellphone } from "../../functions/general/Masks";
import { getSession } from "../../functions/shared/secureStorage";

const GENDER_AVATAR = {
    MASCULINO: require("../../assets/images/man.png"),
    FEMININO: require("../../assets/images/woman.png"),
};

function getAvatar(gender) {
    if (!gender) return null;
    const key = gender.toString().toUpperCase().trim();
    return GENDER_AVATAR[key] ?? null;
}

function InfoRow({ icon, label, value, colors }) {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.mediumRed + "18" }]}>
                <FontAwesome6 name={icon} size={15} color={colors.mediumRed} />
            </View>
            <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.text + "77" }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value || "—"}</Text>
            </View>
        </View>
    );
}

export default function ProfileScreen() {
    const [user, setUser] = useState(null);
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];
    const insets = useSafeAreaInsets();

    useEffect(() => {
        getSession().then((data) => {
            if (data) setUser(data);
        });
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        let year = date.getFullYear();
        if (year < 1000) {
            const parts = dateString.split(" ")[0].split("-");
            year = parts[0].padStart(4, "0");
            return `${parts[2]}/${parts[1]}/${year}`;
        }
        return date.toLocaleDateString("pt-BR");
    };

    const avatarSource = user ? getAvatar(user.gender) : null;

    if (!user)
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.loading, { color: colors.text }]}>Carregando perfil...</Text>
            </View>
        );

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.hero}>
                <View style={[styles.avatarRing, { borderColor: colors.mediumRed + "33" }]}>
                    <View style={[styles.avatarBackground, { backgroundColor: colors.mediumRed + "12" }]}>
                        {avatarSource ? (
                            <Image source={avatarSource} style={styles.avatar} resizeMode="contain" />
                        ) : (
                            <FontAwesome6 name="user" size={72} color={colors.mediumRed} style={{ opacity: 0.5 }} />
                        )}
                    </View>
                </View>
                <Text style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text + "55" }]}>INFORMAÇÕES</Text>

                <InfoRow icon="envelope" label="Email" value={user.email} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
                <InfoRow icon="phone" label="Telefone" value={formatCellphone(user.phone, true)} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
                <InfoRow icon="cake-candles" label="Nascimento" value={formatDate(user.birthDate)} colors={colors} />
                <View style={[styles.divider, { backgroundColor: colors.text + "10" }]} />
                <InfoRow icon="venus-mars" label="Sexo" value={user.gender} colors={colors} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loading: { fontSize: 16, opacity: 0.6 },
    container: {
        alignItems: "center",
        padding: 20,
        paddingBottom: 60,
    },
    hero: {
        alignItems: "center",
        marginBottom: 28,
    },
    avatarRing: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    avatarBackground: {
        width: 144,
        height: 144,
        borderRadius: 72,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatar: {
        width: 130,
        height: 130,
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    card: {
        width: "100%",
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.2,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 10,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    infoText: {
        flex: 1,
        gap: 2,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        marginLeft: 52,
    },
});