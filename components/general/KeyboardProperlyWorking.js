import React from "react";
import { KeyboardAvoidingView, Platform, View, ScrollView, TouchableWithoutFeedback, Keyboard, StyleSheet } from "react-native";

import { useTheme } from "../ThemeContext";

const KeyboardProperlyWorking = ({ children, isScrollView }) => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            {isScrollView ? (
                <ScrollView
                    contentContainerStyle={styles.containerContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={styles.containerContent}>
                    {children}
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerContent: {
        flexGrow: 1,
    },
    containerContentChat: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 10,
    },
});

export default KeyboardProperlyWorking;
