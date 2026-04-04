import styled from "styled-components";

import { Dimensions } from "react-native";

//Screen height
const { height } = Dimensions.get('window');

//cores
export const Cores = {
    preto: "#000000",
    opacoEscuro: "rgba(0, 0, 0, 0.7)"
}

const {preto, opacoEscuro} = Cores;

export const InnerContainer = styled.View`
    flex: 1;
    width: 100%;
    align-items: center;
    justify-content: center;

    ${(props) => props.justifyStart && `
        align-items: center;
        justify-content: start;
    `}

    ${(props) => props.paddingBottom && `
        padding-bottom: 60px;
    `}
`;

export const FundoApp = styled.View`
    height: 100%;
`;

export const ImagesRow = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    position: absolute;
    top: 20px;

    ${(props) => props.bottom && `
        position: absolute;
        align-items: center;
        top: normal;
        bottom: 10px;
    `}
`;

export const PageInformation = styled.View`
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`;

export const PageTitle = styled.Text`
    font-size: 40px;
    text-align: center;
    font-weight: bold;
    color: ${(props) => props.color};
    pading: 10px;

    ${(props) => props.smallerText && `
        font-size: 25px;
        font-weight: normal;
    `}

    ${(props) => props.absolute && `
        position: absolute;
        top: 20px;
    `}
`;

export const SubTitle = styled.Text`
    font-size: 15px;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
    color: ${(props) => props.color};
    text-align: center;
    width: 90%;

    ${(props) => props.welcome && `
        font-weight: normal;
    `}

    ${(props) => props.boldOnText && `
        font-weight: bold;
    `}

    ${(props) => props.undeline && `
        text-decoration: underline;
    `}

    ${(props) => props.isReceiveCode && `
        width: 20px;
        position: absolute;
        top: 41px;
        font-size: 20px;
    `}

    ${(props) => (props.boldOnText && props.welcome) && `
        font-size: 25px;
        font-weight: bold;
    `}

    ${(props) => props.margin && `
        margin-top: 20px;
    `}
`;

export const StyledFormArea = styled.View`
    width: 90%;

    ${(props) => props.RequestLoginForm && `
        margin-top: 30%;
    `}

    ${(props) => props.isReceiveCode && `
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
    `}
`;

export const StyledTextInput = styled.TextInput`
    background-color: ${(props) => props.background};
    padding: 15px;
    padding-left: 55px;
    padding-right: 55px;
    border-radius: 5px;
    height: 60px;
    margin-vertical: 3px;
    margin-bottom: 10px;
    color: ${(props) => props.color}; 

    ${(props) => props.isDisabled == "#989FA7" && `
        background-color: ${props.isDisabled};
    `}

    ${(props) => props.canSearch && `
        width: 90%;
        border-bottom-width: 2px;
        padding-left: 15px;
        border-radius: 0px;
    `}

    ${(props) => props.canSearch == false && `
        display: none;
    `}

    ${(props) => props.isSquare && `
        padding: 2.2%;
        text-align: center;
        margin: 7px;
        height: 50px;
        width: 36px;
    `}

    ${(props) => props.hasBorder && `
        border: 1px solid ${props.borderColor};
    `}

    ${(props) => (props.canSearch && props.hasBorder) && `
        border: none;
        border-radius: 0px;
    `}

    ${(props) => props.multiline && `
        height: auto;
    `}
`;

export const StyledInputLabel = styled.Text`
    color: ${(props) => props.color};
    font-size: 14px;
    text-align: left;

    ${(props) => props.BiggerLabel && `
        font-weight: bold;
        font-size: 15px;
    `}
`;

export const LeftIcon = styled.View`
    left: 15px;
    top: 38px;
    position: absolute;
    z-index: 1;

    ${(props) => props.FontAwesome && `
        top: 41px;
    `}
`;

export const RightIcon = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    right: 15px;
    top: 40px;
    position: absolute;
    z-index: 1;

    ${(props) => props.FontAwesome && `
        top: 41px;
    `}

    ${(props) => props.Arrow && `
        top: 45px;
    `}

    ${(props) => props.Rotate && `
        transform: rotate(180deg);
    `}
`;

export const StyledButton = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    padding: 15px;
    background-color: ${(props) => props.background};
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-vertical: 5px;
    height: 60px;

    ${(props) => props.FormRequestLogin && `
        margin-bottom: 35px;
    `}

    ${(props) => props.isReceiveCode && `
        width: 100%;
    `}

    ${(props) => props.marginTop && `
        margin-top: 20px;
    `}
`;

export const ButtonText = styled.Text`
    color: ${(props) => props.color};
    font-size: 16px;
    font-weight: bold;

    ${(props) => props.google && `
        padding-right: 25px;
        padding-left: 25px;
    `}
`;

export const ButtonIcon = styled.View`
    position: absolute;
    right: 15px;
`;

export const StyledRowView = styled.View`
    width: 100%;
    flex-direction: row;
    padding-vertical: 30px;
    justify-content: space-between;
    align-items: center;
`;

export const CheckBoxKeepConnected = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    width: 17px;
    height: 17px;
    background-color: transparent;
    border: 1px solid ${(props) => props.borderColor};
    border-radius: 5px;

    ${(props) => props.checked && `
        background-color: ${props.checkedColor};
    `}
`;

export const Line = styled.View`
    height: 1px;
    width: 100%;
    background-color: ${(props) => props.color};
    margin-vertical: 10px;

    ${(props) => props.isLight && `
        opacity: 0.2;
        background-color: ${props.color};
    `}
`;

export const ExtraView = styled.View`
    justify-content: center;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;

    ${(props) => props.isReceiveCode && `
        margin-top: 40px;
    `}
`;

export const ExtraText = styled.Text`
    justify-content: center;
    align-items: center;
    color: ${(props) => props.color};
    font-size: 15px;
    `;

export const TextLink = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    justify-content: center;
    align-items: center;

    ${(props) => props.keepConnected && `
        width: 50%;
    `}

    ${(props) => props.forgotPassword && `
        width: 40%;
    `}
`;

export const TextLinkContent = styled.Text`
    
color: ${(props) => props.color};
    font-size: 15px;
    font-weight: bold;

    ${(props) => props.forgotPassword && `
        width: 100%;
        text-decoration: none;
        font-size: 14px;
        text-align: right;
    `}

    ${(props) => props.keepConnected && `
        width: 100%;
        font-size: 14px;
        text-decoration: none;
        text-align: left;
    `}
`;

export const DropdownArea = styled.View`
    width: 100%;
    border-radius: 5px;
    background-color: ${(props) => props.background};
    z-index: 5;
    algin-self: center;
    align-items: center;
    position: absolute;
    margin-bottom: 10px;
    margin-top: 95px;
    
    ${(props) => props.dropdownHeight && `
        max-height: ${props.dropdownHeight}px;
    `}

    ${(props) => props.hasBorder && `
        border: 1px solid ${props.borderColor};
    `}
`;

export const DropdownAreaFlatList = styled.FlatList`
    width: 100%;
`;

export const ItemsDropdown = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    width: 90%;
    height: 50px;
    border-bottom-color: ${(props) => props.borderColor};
    background-color: ${(props) => props.background};
    border-bottom-width: 1px;
    align-self: center;
    justify-content: center;
`;

export const ItemDropdownText = styled.Text`
    width: 100%;
    font-size: 16px;
    color: ${(props) => props.color};
`;

//Menu design
export const ContainerMenu = styled.View`
    flex: 1;
`;

export const UserInfoSection = styled.View`
    padding-left: 20px;
`;

export const UserInfosArea = styled.View`
    flex-direction: row; 
    margin-top: 15px;
`;

export const AvatarUser = styled.Image`
    width: 50px;
    height: 50px;
    margin: 0;
    border-radius: 50px;
    border-width: 2px;
    border-color: ${(props) => props.color};
    background-color: ${(props) => props.background};
`;

export const UserInfos = styled.View`
    margin-left: 15px; 
    flex-direction: column;
`;

export const UserName = styled.Text`
    font-size: 16px;
    margin-top: 3px;
    font-weight: 700;
    color: ${(props) => props.color};
    max-width: 90%;
`;

export const AdditionalInfo = styled.Text`
    font-size: 14px;
    line-height: 14px;
    color: ${(props) => props.color};
    font-weight: normal;
    margin-top: 5px;
    max-width: 90%;
`;

export const NavigationText = styled.Text`
    color: ${(props) => props.color}; 
    font-weight: bold;
`;

export const NavigationTitle = styled.TouchableOpacity.attrs({
    activeOpacity: 1,
})`

`;

export const NavigationTitleText = styled.Text`
    color: ${(props) => props.color}; 
    font-size: 18px;
    font-weight: bold;
`;

//Modal design
export const ModalContent = styled.View`
    background-color: ${(props) => props.background};
    padding: 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;

    ${(props) => props.isMessage && `
        align-items: left;
    `}
`;

export const ModalTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    color: ${(props) => props.color};
`;

export const ModalText = styled.Text`
    font-size: 16px;
    margin-bottom: 20px;
    margin-top: 20px;
    color: ${(props) => props.color};
    flex-direction: row;

    ${(props) => props.removeMargin && `
        margin-top: 5px;
        margin-bottom: 5px;
    `}

    ${(props) => props.onBoldText && `
        font-weight: bold;
    `}
`;

export const ModalClose = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    position: absolute;
    top: 5px;
    right: 5px;
`;

export const ModalButtons = styled.View`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    width: 100%;
    flex-direction: row;
`;

export const ModalButton = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    width: 45%;
    border-radius: 5px;
    background-color: ${(props) => props.background};
    border: 1px solid ${(props) => props.borderColor};
    padding: 12px;
    display: flex;
    align-items: center;

    ${(props) => props.isPositiveButton && `
        background-color: ${props.background};
        border: none;
    `}
`;

export const ModalButtonText = styled.Text`
    font-size: 16px;
    font-weight: normal;
    color: ${(props) => props.color};

    ${(props) => props.isPositiveButton && `
        font-weight: bold;
    `}
`;

//Loading 
export const LoadingBackground = styled.View`
    position: absolute;
    top: 0; 
    left: 0;  
    height: ${height}px;  
    width: 100%; 
    background-color: ${preto};
    opacity: 0.5;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
`;

//Menu right icon
export const MenuRightIcon = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    margin-right: 30px;
    padding: 10px;
`;

//Menu left icon
export const MenuLeftIcon = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    padding: 10px;
`;

//Modal Data
export const ModalBackground = styled.View`
    flex: 1;
    background-color: ${opacoEscuro};
    justify-content: center;
    align-items: center;
`;

export const ModalContainer = styled.View`
    width: 90%;
    border-radius: 10px;
    padding: 10px;
    background: ${(props) => props.background};

    ${(props) => props.yearModal && `
        height: 80%;
    `}
`;

export const TextDateModal = styled.Text`
    textAlign: center;
    marginBottom: 10px;
    fontWeight: bold;
    fontSize: 16px;
    color: ${(props) => props.color};
`;

export const YearSelector = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
`;

export const YearItem = styled.TouchableOpacity.attrs({
        activeOpacity: 1,
    })`
    height: ${(props) => props.height}px;
    justify-content: center;
    align-items: center;
`;

export const YearText = styled.Text`
    font-size: 18px;
    color: ${(props) => props.color};
`;