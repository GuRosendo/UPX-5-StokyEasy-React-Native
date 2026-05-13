import { handleMessage } from "../../components/general/ToastMessage";
import { clearSession } from "../../functions/shared/secureStorage";

export const handleLogout = async (toggleModal, setStoredData) => {
    try {
        toggleModal();
        await clearSession();
        setStoredData(null);
    } catch (error) {
        handleMessage(false, "Ocorreu um erro", "Ocorreu um erro ao remover os dados");
    }
};