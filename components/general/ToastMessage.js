import Toast from 'react-native-toast-message';

import { loadThemeFromStorage } from "../LoadThemeFromStorage";

let currentTheme = 'light';

export const updateToastTheme = async () => {
    return await loadThemeFromStorage();
};

//mensage error/success
export const handleMessage = async(success, status, message, warning) => {
    currentTheme = await updateToastTheme();

    Toast.show({
        type: warning ? "info" : (success ? "success" : "error"),
        text1: status,
        text2: message,
        position: "bottom",
        autoHide: 5000,
        props: {
            currentTheme: currentTheme 
        }
    });
};