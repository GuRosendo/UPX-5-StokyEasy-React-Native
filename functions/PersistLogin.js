import AsyncStorage from '@react-native-async-storage/async-storage';

import { handleMessage } from "../components/general/ToastMessage";

//Check Login
export const persistLogin = async (credentials, setStoredData) => {
    try {
        const stored = await AsyncStorage.getItem("users");
        const list = stored ? JSON.parse(stored) : [];

        const updatedList = list.map(u => ({ ...u, isLogged: 0 }));

        const userIndex = updatedList.findIndex(
            u => u.email === credentials.login && u.password === credentials.password
        );

        if (userIndex === -1) {
            handleMessage(false, "Erro", "Usuário não encontrado para persistir login");
            return;
        }

        updatedList[userIndex].isLogged = 1;

        await AsyncStorage.setItem("users", JSON.stringify(updatedList));

        await AsyncStorage.setItem("userData", JSON.stringify(updatedList[userIndex]));

        setStoredData(updatedList[userIndex]);

    } catch (error) {
        console.log("Erro ao persistir login:", error);
        handleMessage(false, "Erro", "Falha ao salvar login.");
    }
};