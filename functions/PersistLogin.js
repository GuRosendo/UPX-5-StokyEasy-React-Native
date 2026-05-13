import { handleMessage } from "../components/general/ToastMessage";
import { getUsers, updateUser, setSession } from "./shared/secureStorage";

export const persistLogin = async (credentials, setStoredData) => {
    try {
        const list = await getUsers();

        const userFound = list.find(
            u => u.email === credentials.login && u.password === credentials.password
        );

        if (!userFound) {
            handleMessage(false, "Erro", "Usuário não encontrado para persistir login");
            return;
        }

        // Desloga todos os outros usuários
        for (const u of list) {
            if (u.isLogged === 1) {
                await updateUser({ ...u, isLogged: 0 });
            }
        }

        const loggedUser = { ...userFound, isLogged: 1 };
        await updateUser(loggedUser);
        await setSession(loggedUser);

        setStoredData(loggedUser);

    } catch (error) {
        console.log("Erro ao persistir login:", error);
        handleMessage(false, "Erro", "Falha ao salvar login.");
    }
};