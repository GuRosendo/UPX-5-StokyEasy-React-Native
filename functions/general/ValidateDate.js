import { formatDate } from './Masks';
import { ValidateDateOfBirth } from './ValidateDateOfBirth';

//validate date
export const validateDate = (dateStart, dateEnd, validateWithToday, isStartEnd, isDateOfBirth) => {
    if(isStartEnd){
        if(dateStart && dateEnd){
            dateStart = formatDate(new Date(dateStart), "EUA", false);
            dateEnd = formatDate(new Date(dateEnd), "EUA", false);
    
            if(!dateStart || !dateEnd){
                return false;
            }

            dateStart = new Date(dateStart);
            dateEnd = new Date(dateEnd);
                
            if(validateWithToday){
                let today = formatDate(new Date(), "EUA", false);
    
                if(!today){
                    return false;
                }
                
                today = new Date(today);

                if(dateStart < today){
                    return { success: false, status: 'Ocorreu um erro', message: 'Data inicial menor que a data de hoje' };
                }
    
                if(dateEnd < today){
                    return { success: false, status: 'Ocorreu um erro', message: 'Data final menor que a data de hoje' };
                }
            }
    
            if(dateStart > dateEnd){
                return { success: false, status: 'Ocorreu um erro', message: 'Data inicial maior que a data final' };
            }
    
            return { success: true };
        }
        return { success: false, status: 'Ocorreu um erro', message: 'As datas informadas estão incorretas' };
    }

    if(isDateOfBirth){
        return ValidateDateOfBirth(dateStart);
    }
}