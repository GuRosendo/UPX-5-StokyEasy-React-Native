import { handleMessage } from "../components/general/ToastMessage";

//login
export const handleForgotPassword = (credentials) => {
    if(credentials.login == ""){
        handleMessage(false, "Ocorreu um erro", "Preencha o campo");
        return false;
    }

    if(credentials.login.length < 8 || !credentials.login.includes('@') || !credentials.login.includes('.')){
        handleMessage(false, "Ocorreu um erro", "Email inválido");
        return false;
    }    

    return true;
};