import AsyncStorage from "@react-native-async-storage/async-storage";

export const VerifyLogin = async(setStoredData) => {
    const result = await AsyncStorage.getItem("userData");

    if(result != null){
        setStoredData(JSON.parse(result));
    }else{
        setStoredData(null);
    }
}