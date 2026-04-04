// export const Timer = (timer, setTimer, setShowButton, intervalRef) => {

//     if(timer > 0 && intervalRef.current == null){
//         intervalRef.current = setInterval(() => {
//             setTimer(prevTime => prevTime - 1);
//         }, 1000);

//         setShowButton(false);
//     } 
    
//     if(timer <= 0){
//         setShowButton(true);
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//     }

//     return () => clearInterval(intervalRef.current);
// }