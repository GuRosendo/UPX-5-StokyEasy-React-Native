import React, { useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome6 } from "@expo/vector-icons";

import Login from "../screens/Login";
import RequestLogin from "../screens/RequestLogin";

import { LoginDataContext } from "../components/LoginDataContext";
import { ModalCustom } from "../components/general/ModalCustom";
import { MenuLeftIcon } from "../components/general/styles";

import { BottomTabsLayout } from "../components/logged/BottomTabsLayout";

import { useTheme } from "../components/ThemeContext";

const Stack = createStackNavigator();

const NavigationRootStack = () => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    const [isModalVisible, setModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState("");

    const toggleModal = () => setModalVisible(!isModalVisible);

    return (
        <>
            <ModalCustom 
                isModalVisible={isModalVisible}
                toggleModal={toggleModal}
                isHistoryModal={true}
                setFilterValues={setFilterValues}
            />

            <LoginDataContext.Consumer>
                {({ storedData }) => (
                    <NavigationContainer>
                        <Stack.Navigator
                            screenOptions={({ navigation }) => ({
                                headerShown: false,
                                headerStyle: {
                                    backgroundColor: colors.background,
                                },
                                headerTintColor: colors.text,
                                headerTransparent: true,
                                headerLeftContainerStyle: { paddingLeft: 20 },
                                headerLeft: () => (
                                    <MenuLeftIcon onPress={() => navigation.goBack()}>
                                        <FontAwesome6
                                            name="chevron-left"
                                            size={20}
                                            color={colors.text}
                                        />
                                    </MenuLeftIcon>
                                ),
                            })}
                            initialRouteName="Login"
                        >

                        {storedData ? (
                            <Stack.Screen 
                                name="Tabs" 
                                component={BottomTabsLayout} 
                                options={{ headerShown: false }}
                            />
                        ) : (
                            <>
                                <Stack.Screen name="Login" component={Login} />
                                <Stack.Screen name="RequestLogin" component={RequestLogin} />
                            </>
                        )}

                        </Stack.Navigator>
                    </NavigationContainer>
                )}
            </LoginDataContext.Consumer>
        </>
    );
};

export default NavigationRootStack;
