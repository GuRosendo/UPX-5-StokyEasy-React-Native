import React from "react";
import { Modal, TouchableWithoutFeedback, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import {
    ModalContent,
    ModalTitle,
    ModalText,
    ModalClose,
    ModalButtons,
    ModalButton,
    ModalButtonText,
} from "../../components/general/styles";
import { useTheme } from "../ThemeContext";

/**
 * ConfirmModal — substituto genérico para Alert.alert com 2 botões.
 *
 * Props:
 *  visible        {boolean}
 *  title          {string}
 *  message        {string}
 *  confirmText    {string}   default "Confirmar"
 *  cancelText     {string}   default "Cancelar"
 *  isDanger       {boolean}  botão de confirmação fica vermelho (default true)
 *  onConfirm      {fn}
 *  onClose        {fn}
 */
export function ConfirmModal({
    visible,
    title,
    message,
    confirmText = "Confirmar",
    cancelText  = "Cancelar",
    isDanger    = true,
    onConfirm,
    onClose,
}) {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "center", alignItems: "center" }}>
                    <TouchableWithoutFeedback>
                        <ModalContent background={colors.background}>
                            <ModalTitle color={colors.text}>{title}</ModalTitle>
                            <ModalText color={colors.text}>{message}</ModalText>

                            <ModalClose onPress={onClose}>
                                <FontAwesome6 name="xmark" color={colors.text} size={22} />
                            </ModalClose>

                            <ModalButtons>
                                <ModalButton onPress={onClose} borderColor={colors.text}>
                                    <ModalButtonText color={colors.text}>{cancelText}</ModalButtonText>
                                </ModalButton>

                                <ModalButton
                                    onPress={() => { onConfirm(); onClose(); }}
                                    isPositiveButton={true}
                                    background={
                                        isDanger
                                            ? (theme === "light" ? colors.mediumRed : colors.darkRed)
                                            : "#27ae60"
                                    }
                                >
                                    <ModalButtonText isPositiveButton={true} color={colors.white}>
                                        {confirmText}
                                    </ModalButtonText>
                                </ModalButton>
                            </ModalButtons>
                        </ModalContent>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}