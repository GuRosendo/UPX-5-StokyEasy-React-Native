import { handleMessage } from "../components/general/ToastMessage";
import { getUsers } from "./shared/secureStorage";

export const handleLogin = async (credentials) => {
    if (credentials.login == "" || credentials.password == "") {
        handleMessage(false, "Ocorreu um erro", "Preencha todos os campos");
        return false;
    }

    if (credentials.login.length < 8 || !credentials.login.includes("@") || !credentials.login.includes(".")) {
        handleMessage(false, "Ocorreu um erro", "Email ou senha incorreto(s)");
        return false;
    }

    if (credentials.password.length < 8) {
        handleMessage(false, "Ocorreu um erro", "Email ou senha incorreto(s)");
        return false;
    }

    const list = await getUsers();

    const userFound = list.find(
        u => u.email?.toLowerCase() === credentials.login.toLowerCase() && u.password === credentials.password
    );

    if (!userFound) {
        handleMessage(false, "Erro", "Email ou senha incorreto(s)");
        return false;
    }

    return true;
};