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
import { PageTitle } from "./components/general/styles";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#186C8C",
        backgroundColor: props.props?.currentTheme == "light" ? "#FFFFFF" : "#1E1E1E",
        borderLeftWidth: 7,
        width: "90%",
        height: 100,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: "700",
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
      text2Style={{
        fontSize: 14,
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      text2NumberOfLines={3}
      style={{
        borderLeftColor: "#A70000",
        backgroundColor: props.props?.currentTheme == "light" ? "#FFFFFF" : "#1E1E1E",
        borderLeftWidth: 7,
        width: "90%",
        height: 100,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: "700",
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
      text2Style={{
        fontSize: 14,
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#F4D03F",
        backgroundColor: props.props?.currentTheme == "light" ? "#FFFFFF" : "#1E1E1E",
        borderLeftWidth: 7,
        width: "90%",
        height: 100,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: "700",
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
      text2Style={{
        fontSize: 14,
        color: props.props?.currentTheme == "light" ? "#000000" : "#F2F0EF",
      }}
    />
  )
};

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
        const timer = setTimeout(() => {
          setAppLoaded(true);
        }, 2000);

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

          <Toast config={toastConfig} />
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