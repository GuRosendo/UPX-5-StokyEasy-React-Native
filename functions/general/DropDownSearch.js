//filter search on dropdown
export const onSearch = (search, data) => {
    if(search != ''){
        let result = data.filter(item => {
            return item.text.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1;
        });
        
        return result;
    }else{
        return data;
    }
}