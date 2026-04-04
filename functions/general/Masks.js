//format cpf
export const formatCpf = (cpf, masked) => {
    if(!cpf){
        return
    }

    cpf = cpf.replace(/\D/g, "");

    cpf = cpf.substring(0, 11);

    if (masked) {
        if (cpf.length <= 3) {
            return cpf.replace(/(\d{0,3})/, "$1");
        }
        if (cpf.length <= 6) {
            return cpf.replace(/(\d{3})(\d{0,3})/, "$1.$2");
        }
        if (cpf.length <= 9) {
            return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
        }
        if (cpf.length <= 11) {
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
        }
    }
    
    return cpf;
}

//format sus
export const formatSus = (sus, masked) => {
    if(!sus){
        return
    }

    sus = sus.replace(/\D/g, "");

    sus = sus.substring(0, 15);

    if (masked) {
        if (sus.length <= 3) {
            return sus.replace(/(\d{0,3})/, "$1");
        }
        if (sus.length <= 7) {
            return sus.replace(/(\d{3})(\d{0,4})/, "$1.$2");
        }
        if (sus.length <= 11) {
            return sus.replace(/(\d{3})(\d{4})(\d{0,4})/, "$1.$2.$3");
        }
        if (sus.length <= 15) {
            return sus.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, "$1.$2.$3.$4");
        }
    }
        
    return sus;
}

//format cellphone
export const formatCellphone = (cellphone, masked, censure) => {
    if(!cellphone){
        return
    }

    cellphone = cellphone.replace(/\D/g, "");

    cellphone = cellphone.substring(0, 11);

    if(masked){
        if(cellphone.length <= 2){
            return cellphone.replace(/(\d{0,2})/, "$1");
        }
        if(cellphone.length < 8){
            return cellphone.replace(/(\d{2})(\d{0,5})/, "($1) $2");
        }
        if(cellphone.length >= 8){
            let formatted = cellphone.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");

            if(censure){
                formatted = formatted.replace(/(\(\d{2}\)) \d{5}/, (_match, ddd) => `${ddd} *****`);
            }

            return formatted;
        }
    }

    if(censure){
        return cellphone.replace(/^(\d{2})\d{5}/, "$1*****");
    }
    
    return cellphone;
}

export const formatHeight = (value, masked) => {
  if (!value) return "";

  value = value.replace(/\D/g, "");

  value = value.substring(0, 3);

  if (!masked) return value;

  if (value.length === 1) {
    return value;
  }

  if (value.length === 2) {
    return value.replace(/(\d)(\d)/, "$1,$2");
  }

  if (value.length === 3) {
    return value.replace(/(\d)(\d{2})/, "$1,$2");
  }

  return value;
};

export const formatWeight = (value, masked) => {
  if (!value) return "";

  value = value.replace(/\D/g, "");

  value = value.substring(0, 5);

  if (!masked) return value;

  if (value.length <= 2) {
    return value;
  }

  if (value.length === 3) {
    return value.replace(/(\d)(\d{2})/, "$1,$2");
  }

  if (value.length === 4) {
    return value.replace(/(\d{2})(\d{2})/, "$1,$2");
  }

  if (value.length === 5) {
    return value.replace(/(\d{3})(\d{2})/, "$1,$2");
  }

  return value;
};

//format cep
export const formatCep = (cep, masked) => {
    if(!cep){
        return
    }
    
    cep = cep.replace(/\D/g, "");

    cep = cep.substring(0, 8);

    if (masked) {
        if (cep.length <= 5) {
            return cep.replace(/(\d{0,5})/, "$1");
        }
        if (cep.length <= 8) {
            return cep.replace(/(\d{5})(\d{0,3})/, "$1-$2");
        }
    }
    
    return cep;
}

//format date to YYYY-MM-DD
export const formatDate = (date, country, hour) => {
    if(date instanceof Date && !isNaN(date.getTime())){
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const time = `${hours}:${minutes}:${seconds}`;

        if(country == "EUA"){
            return hour ? `${year}-${month}-${day} ${time}` : `${year}-${month}-${day}`;
        }

        if(country == "BR"){
            return hour ? `${day}/${month}/${year} ${time}` : `${day}/${month}/${year}`;
        }
    }

    return false;
}