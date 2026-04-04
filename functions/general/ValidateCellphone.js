//validate cellphone
export const validateCellphone = (cellphone) => {
    cellphone = cellphone.replace(/\D/g, '');

    if(isNaN(cellphone)){
        return false;
    }

    if(!cellphone || cellphone == ''){
        return false;
    }

    if(cellphone.length < 10 || cellphone.length > 11){
        return false;
    }

    const ddd = cellphone[0] + cellphone[1];
    const number = cellphone.substr(2);

    return {ddd: ddd, number: number};
}