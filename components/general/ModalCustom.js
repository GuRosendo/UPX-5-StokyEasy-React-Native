import React, { useState } from 'react';

import { View } from 'react-native';

import {
    ModalContent,
    ModalTitle,
    ModalText,
    ModalClose,
    ModalButtons,
    ModalButton,
    ModalButtonText,
    StyledFormArea,
    StyledButton,
    ButtonText,
} from '../../components/general/styles';

import Modal from 'react-native-modal';
import { handleLogout } from '../../functions/logged/Logout';

//inputs
import { Input } from './Input';
//datetime
import { ActivityIndicator } from "react-native";
import { FontAwesome6 } from '@expo/vector-icons';

import { useTheme } from '../ThemeContext';

const ModalCustom = ({ isModalVisible, toggleModal, setStoredData, storedData, isExit }) => {
    const { theme, themeColors } = useTheme();

    const colors = themeColors[theme];

    const [ocultaCloseModal, setOcultaCloseModal] = useState(false);

    return (
        <View>
            {isExit && (
                <Modal isVisible={isModalVisible} onBackdropPress={!ocultaCloseModal ? toggleModal : undefined}>
                    <ModalContent background={colors.background}>
                        <ModalTitle color={colors.text}>Sair</ModalTitle>
                        <ModalText color={colors.text}>Você tem certeza que deseja sair?</ModalText>

                        {!ocultaCloseModal && (
                            <ModalClose onPress={toggleModal}>
                                <FontAwesome6
                                    name="xmark"
                                    color={colors.text}
                                    size={25} />
                            </ModalClose>
                        )}

                        <ModalButtons>
                            <ModalButton 
                                onPress={toggleModal}
                                borderColor={colors.text}>
                                <ModalButtonText
                                    color={colors.text}>Não
                                </ModalButtonText>
                            </ModalButton>
                            
                            <ModalButton 
                                onPress={async () => handleLogout(toggleModal, setStoredData, storedData)} 
                                isPositiveButton={true}
                                background={theme == "light" ? colors.mediumRed : colors.darkRed}
                            >
                                <ModalButtonText 
                                    isPositiveButton={true} 
                                    color={colors.white}>Sim
                                </ModalButtonText>
                            </ModalButton>
                        </ModalButtons>
                    </ModalContent>
                </Modal>
            )}
        </View>
    );
};

export { ModalCustom };
