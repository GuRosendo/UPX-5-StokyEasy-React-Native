import { handleMessage } from "../components/general/ToastMessage";

//login
export const handleCreateNewPassword = (credentials) => {
    if(credentials.password == "" || credentials.repeatedPassword == ""){
        handleMessage(false, "Ocorreu um erro", "Preencha todos os campos");
        return false;
    }
    
    if(credentials.password.length < 8 || credentials.repeatedPassword.length < 8){
        handleMessage(false, "Ocorreu um erro", "A senha deve conter no mínimo 8 dígitos");
        return false;
    }

    if(credentials.password != credentials.repeatedPassword){
        handleMessage(false, "Ocorreu um erro", "As senhas não coincidem");
        return false;
    }

    handleMessage(true, "Sucesso", "Senha alterada com sucesso");
    return true;
};