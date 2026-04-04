const moveToNextInput = (index, inputs) => {
    if (index < inputs.current.length - 1) {
        inputs.current[index + 1].focus();
    }
};

//Handle input change for each digit
const handleChange = (text, numberInputs, index, inputs, code, setCode) => {
    const newCode = [...code];
    newCode[index] = text;  //Update the code array at the specified index
    setCode(newCode);  //Update the state with the new array

    //If text is filled, move focus to the next input
    if(text.length > 0 && index < numberInputs - 1){
        moveToNextInput(index, inputs);
    }
};

//Move focus to previous input
export const moveToPreviousInput = (index, inputs) => {
    if(index > 0){
        inputs.current[index - 1].focus();
    }
};

//Function to handle the input paste for distributing the code
export const handleTextChange = (text, numberInputs, index, inputs, code, setCode) => {
    const formattedText = text.replace(/\D/g, '');
    
    // Só atualiza se houver texto (ignora backspace)
    if(formattedText.length > 0) {
        if(formattedText.length == 1){
            handleChange(formattedText, numberInputs, index, inputs, code, setCode);
        }
        
        if(formattedText.length > 2){
            const newCode = formattedText.split('').slice(0, numberInputs);
            setCode(newCode);
        }
    }
};