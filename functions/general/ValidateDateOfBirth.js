import { formatDate } from "./Masks";

//validate date of birth
export const ValidateDateOfBirth = (date) => {
    if(date){
        date = formatDate(new Date(date), "EUA", false);

        let today = formatDate(new Date(), "EUA", false);

        if(!today){
            return false;
        }

        if(!date){
            return false;
        }

        const limiteIdade = new Date();
        limiteIdade.setFullYear(limiteIdade.getFullYear() - 130);

        date = new Date(date);
        today = new Date(today);

        if(date > today){
            return false;
        }

        if(date < limiteIdade){
            return false;
        }

        return true;
    }
    return false;
}