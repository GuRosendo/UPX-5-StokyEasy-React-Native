import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { handleMessage } from './general/ToastMessage';

import { loadThemeFromStorage } from './LoadThemeFromStorage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");

    const [isLoading, setIsLoading] = useState(true); 

    const themeColors = {
        light: {
            background: "#F2F0EF",
            card: "#FFFFFF",
            white: "#F2F0EF",
            black: "#121212",
            text: "#000000",
            darkRed: "#5c1c25ff",
            mediumRed: "#7a1d29ff",
            mediumRedOpaque: "#7a1d2938",
            strongRed: "#3d0e14ff",
            Red: '#1498B5',
            cyan: "#0CDAF2",
            grey: "#989FA7",
            disabled: "#D6DEE2",
            error: "#A70000",
            warning: "#F4D03F",
            transparent: "transparent",
            opaque: "rgba(0, 0, 0, 0.2)",
            darkOpaque: "rgba(0, 0, 0, 0.7)",
        },
        dark: {
            background: "#121212",
            card: "#1E1E1E",
            white: "#F2F0EF",
            black: "#121212",
            text: "#F2F0EF",
            darkRed: "#5c1c25ff",
            mediumRed: "#7a1d29ff",
            mediumRedOpaque: "#7a1d2938",
            strongRed: "#3d0e14ff",
            Red: '#1498B5',
            cyan: "#0CDAF2",
            grey: "#989FA7",
            disabled: "#D6DEE2",
            error: "#A70000",
            warning: "#F4D03F",
            transparent: "transparent",
            opaque: "rgba(0, 0, 0, 0.2)",
            darkOpaque: "rgba(0, 0, 0, 0.7)",
        }
    };

    const saveThemeToStorage = async (newTheme, backgroundTheme) => {
        try{
            await AsyncStorage.setItem('theme', newTheme);
            await AsyncStorage.setItem('backgroundTheme', backgroundTheme);
        }catch (e){
            handleMessage(false, "Ocorreu um erro", "Erro ao salvar o tema: " + e);
        }
    };

    useEffect(() => {
        const runEffect = async () => {
            await loadThemeFromStorage(setTheme, false, setIsLoading);
        };

        runEffect();
    }, []);

    const toggleTheme = () => {
        const newTheme = theme == 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        saveThemeToStorage(newTheme, themeColors[newTheme].background);
    };

    if(isLoading){
        return null; 
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
            <StatusBar 
                barStyle={theme == 'light' ? "dark-content" : "light-content"} 
                backgroundColor={themeColors[theme].background}
            />
            {children}
        </ThemeContext.Provider>
    );
};
