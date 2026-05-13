import { handleMessage } from "../components/general/ToastMessage";
import { validateCellphone } from "./general/ValidateCellphone";
import { validateDate } from "./general/ValidateDate";
import { getUsers, saveUser, getNextUserId } from "./shared/secureStorage";

export const handleRequestLogin = async (credentials) => {
    let result = { success: true, status: "Sucesso ao criar conta", message: "Use os dados informados para logar" };

    // validate nome
    if (!credentials.nomeCompleto || credentials.nomeCompleto == "" || !isNaN(parseInt(credentials.nomeCompleto)) || !(credentials.nomeCompleto.split(" ")[1])) {
        handleMessage(false, "Ocorreu um erro", "Nome incorreto");
        return false;
    }

    // validate sexo
    if (!credentials.sexo || credentials.sexo == "") {
        handleMessage(false, "Ocorreu um erro", "Sexo incorreto");
        return false;
    }

    // validate cellphone
    if (!validateCellphone(credentials.celular)) {
        handleMessage(false, "Ocorreu um erro", "Número de celular incorreto");
        return false;
    }

    // validate date of birth
    if (!validateDate(credentials.dataNascimento, false, false, false, true)) {
        handleMessage(false, "Ocorreu um erro", "Data de nascimento inválida");
        return false;
    }

    // validate email
    if (!credentials.email || !credentials.email.includes("@") || !credentials.email.includes(".")) {
        handleMessage(false, "Ocorreu um erro", "Email incorreto");
        return false;
    }

    // validate password
    if (!credentials.password || credentials.password.length < 8) {
        handleMessage(false, "Ocorreu um erro", "Senha incorreta, a senha deve possuir 8 caracteres");
        return false;
    }

    // validate both passwords
    if (!credentials.repeatedPassword || credentials.repeatedPassword.length < 8 || credentials.password != credentials.repeatedPassword) {
        handleMessage(false, "Ocorreu um erro", "As senhas não coincidem");
        return false;
    }

    // requisição api
    if (!result.success) {
        handleMessage(result.success, result.status, result.message);
        return false;
    }

    if (result.success) {
        const list = await getUsers();

        const emailExists = list.some(user => user.email.toLowerCase() === credentials.email.toLowerCase());

        if (emailExists) {
            handleMessage(false, "Ocorreu um erro", "Já existe uma conta com esse email");
            return false;
        }

        const nextId = await getNextUserId();

        const newUser = {
            id: nextId,
            fullName: credentials.nomeCompleto,
            gender: credentials.sexo,
            phone: credentials.celular,
            birthDate: credentials.dataNascimento,
            email: credentials.email,
            password: credentials.password,
            weight: credentials.weight,
            height: credentials.height,
            isLogged: 0,
        };

        await saveUser(newUser);

        handleMessage(result.success, result.status, result.message);
        return true;
    }
};