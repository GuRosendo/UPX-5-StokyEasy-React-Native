import { handleMessage } from "../components/general/ToastMessage";

export const handleValidateCode = (credentials, numberInputs, registerNewDevice) => {
    let url = "";

    if(credentials.code.length != numberInputs){
        handleMessage(false, "Ocorreu um erro", "Código de verificação inválido");
        return false;
    }

    for(let number of credentials.code){
        const numeric = Number(number);

        if(!Number.isInteger(numeric) || numeric < 0 || number.length != 1){
            handleMessage(false, "Ocorreu um erro", "Código de verificação inválido");
            return false;
        }
    }

    return true;
}