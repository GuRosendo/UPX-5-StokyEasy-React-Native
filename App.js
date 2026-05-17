import React, { useState, useEffect, useRef } from "react";
import { StatusBar, View, StyleSheet, Animated, Dimensions, Image } from "react-native";
import NavigationRootStack from "./navigators/NavigationRootStack";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

import { LoginDataContext } from "./components/LoginDataContext";
import * as SplashScreen from "expo-splash-screen";
import { VerifyLogin } from "./functions/general/verifyLogin";

import { ThemeProvider } from "./components/ThemeContext";

import { loadThemeFromStorage } from "./components/LoadThemeFromStorage";

import { handleMessage } from "./components/general/ToastMessage";
import { ToastPortal } from "./components/general/ToastPortal";
import { PageTitle } from "./components/general/styles";

import { initDatabase } from "./screens/logged/shared/database";

export default function Index() {
  const [appLoaded, setAppLoaded] = useState(false);

  const translateX = useRef(new Animated.Value(-Dimensions.get("window").width)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [theme, setTheme] = useState("light");
  const [themeBackground, setThemeBackground] = useState("#F2F0EF");

  const [storedData, setStoredData] = useState(null);

  // const logoSource = theme === "light" ? require("./assets/images/Logo.png") : require("./assets/images/LogoLight.png");

  const logoSource = "";

  useEffect(() => {
    const checkTheme = async () => {
      await loadThemeFromStorage(setTheme, setThemeBackground);

      initDatabase();
      checkLogin();
    }
    
    const checkLogin = async () => {
      try {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0, 
            duration: 1500, 
            useNativeDriver: true,
          }),

          Animated.timing(opacity, {
            toValue: 1, 
            duration: 1500,
            useNativeDriver: true,
          })
        ]).start();

        await SplashScreen.preventAutoHideAsync();

        await VerifyLogin(setStoredData);
      } catch (error) {
        handleMessage(false, "Ocorreu um erro", "Erro ao carregar os dados do usuário: " + error);
      } finally {
        setAppLoaded(true);

        await SplashScreen.hideAsync();
      }
    };

    checkTheme();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeBackground }]}>
      {!appLoaded ? (
        <>
          <StatusBar barStyle={theme == "light" ? "dark-content" : "light-content"} backgroundColor={themeBackground} />

          <View style={styles.splashContainer}>
            <Animated.View
              style={[ 
                { transform: [{ translateX: translateX }] }, 
              ]}
            >
              <Image
                source={logoSource}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </>
      ) : (
        <>
          <StatusBar barStyle={theme == "light" ? "dark-content" : "light-content"} backgroundColor={themeBackground} />

          <LoginDataContext.Provider value={{ storedData, setStoredData }}>
            <ThemeProvider>
              <NavigationRootStack />
            </ThemeProvider>
          </LoginDataContext.Provider>

          <ToastPortal theme={theme} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  splashContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center", 
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: 260,
    height: 260,
  }
});