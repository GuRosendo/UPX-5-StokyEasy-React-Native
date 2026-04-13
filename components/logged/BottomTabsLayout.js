import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome6 } from "@expo/vector-icons";

import InitialPage from "../../screens/logged/InitialPage";

import ProfileScreen from "../../screens/logged/ProfileScreen";

import ClientsScreen from "../../screens/logged/clients/ClientsScreen";
import ProductsScreen from "../../screens/logged/products/ProductsScreen";

import { useTheme } from "../ThemeContext";

const Tab = createBottomTabNavigator();

export const BottomTabsLayout = () => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 0,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarActiveTintColor: colors.mediumRed,
                tabBarInactiveTintColor: colors.text,
            }}
        >
            <Tab.Screen
                name="Home"
                component={InitialPage}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome6 name="house-chimney" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Produtos"
                component={ProductsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome6 name="boxes-stacked" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Clientes"
                component={ClientsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome6 name="user-group" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Perfil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome6 name="user" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};