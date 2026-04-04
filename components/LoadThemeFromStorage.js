import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadThemeFromStorage = async (setTheme, setThemeBackground, setIsLoading) => {
    try{
        const storedTheme = await AsyncStorage.getItem('theme');
        const storedthemeBackground = await AsyncStorage.getItem('backgroundTheme');
        
        if(storedTheme){
            if(setTheme){
                setTheme(storedTheme);
            }

            if(setThemeBackground){
                setThemeBackground(storedthemeBackground);
            }

            return storedTheme;
        }else{
            if(setTheme){
                setTheme('light');
            }

            if(setThemeBackground){
                setThemeBackground("#F2F0EF");
            }

            return 'light';
        }
    }catch(e){
        if(setTheme){
            setTheme('light');
        }
        
        if(setThemeBackground){
            setThemeBackground("#F2F0EF");
        }

        return 'light';
    }finally{
        if(setIsLoading){
            setIsLoading(false); 
        }
    }
}