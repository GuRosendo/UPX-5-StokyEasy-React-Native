import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleMessage } from '../../components/general/ToastMessage';

export const handleLogout = async(toggleModal, setStoredData, storedData) => {
    try {
        toggleModal();
        await AsyncStorage.removeItem("userData");
        setStoredData(null);
    } catch (error) {
        handleMessage(false, "Ocorreu um erro", "Ocorreu um erro ao remover os dados");
    }
};