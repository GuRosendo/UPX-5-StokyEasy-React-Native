import{ handleMessage } from "../components/general/ToastMessage";

import AsyncStorage from "@react-native-async-storage/async-storage";

//login
export const handleLogin = async(credentials) =>{
    let result = { success: true, status: 'Sucesso', message: 'Login correto' };

    const stored = await AsyncStorage.getItem("users");
    const list = stored ? JSON.parse(stored) : [];

    if(credentials.login == "" || credentials.password == ''){
        handleMessage(false, "Ocorreu um erro", "Preencha todos os campos");
        return false;
    }

    if(credentials.login.length < 8 || !credentials.login.includes('@') || !credentials.login.includes('.')){
        handleMessage(false, "Ocorreu um erro", "Email ou senha incorreto(s)");
        return false;
    }

    if(credentials.password.length < 8){
        handleMessage(false, "Ocorreu um erro", "Email ou senha incorreto(s)");
        return false;
    }

    const userFound = list.find(
        u => u.email === credentials.login && u.password === credentials.password
    );

    if (!userFound) {
        handleMessage(false, "Erro", "Email ou senha incorreto(s)");
        return false;
    }

    return true;
};