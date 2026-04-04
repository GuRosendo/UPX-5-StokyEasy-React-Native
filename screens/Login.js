import React, { useState, useContext, useCallback, useEffect  } from 'react';
import { Keyboard, ActivityIndicator } from 'react-native';
import {
    InnerContainer,
    PageTitle,
    SubTitle,
    StyledFormArea,
    StyledButton,
    ButtonText,
    StyledRowView,
    CheckBoxKeepConnected,
    Line,
    ExtraText,
    TextLink,
    TextLinkContent,
    ExtraView,
    FundoApp,
} from '../components/general/styles';
import { Formik } from 'formik';
import KeyboardProperlyWorking from './../components/general/KeyboardProperlyWorking';
import { handleLogin } from '../functions/Login';
import { LoginDataContext } from '../components/LoginDataContext';

import { LogoCustom } from '../components/general/LogoCustom';

//input
import { Input } from '../components/general/Input';
import { persistLogin } from '../functions/PersistLogin';

import { useTheme } from '../components/ThemeContext';

const Login = ({ navigation, route }) => {
    const [hidePassword, setHidePassword] = useState(true);
    const [hideTextPresentation, setHideTextPresentation] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const {storedData, setStoredData} = useContext(LoginDataContext);

    const [hidePasswordInput, setHidePasswordInput] = useState(false);

    const { theme, themeColors } = useTheme();
        
    const colors = themeColors[theme];

    Keyboard.addListener('keyboardDidShow', () => {
        setHideTextPresentation(true);
    });
    Keyboard.addListener('keyboardDidHide', () => {
        setHideTextPresentation(false);
    });

    const handleKeepConnected = () => {        
        setIsChecked(!isChecked);
    };  

    useEffect(() => {
        if(route.params){
            setHidePasswordInput(false);
        }
    }, [route.params]);

    return (
        <KeyboardProperlyWorking>
            <FundoApp>
                <InnerContainer>
                    {!hideTextPresentation && 
                        <>
                            <LogoCustom bottom={false}/>
                        </>
                    }

                    <SubTitle color={colors.text}>Seja bem vindo(a) ao <SubTitle boldOnText={true}>Eco Move!</SubTitle></SubTitle>

                    <Formik
                        initialValues={{ login: '', password: '' }}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);

                            setTimeout(async() => { 
                                if(await handleLogin(values)){
                                    await persistLogin(values, setStoredData);
                                }
                                setSubmitting(false);
                            }, 1000)
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, isSubmitting, values }) => (
                            <StyledFormArea>
                                <Input
                                    label="Email"
                                    icon="user-large"
                                    placeholder="Informe seu Email"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('login')}
                                    value={values.login}
                                />

                                {!hidePasswordInput && (
                                    <Input
                                        label="Senha"
                                        icon="user-lock"
                                        placeholder="Informe sua senha"
                                        placeholderTextColor={colors.text}
                                        onChangeText={handleChange('password')}
                                        value={values.password}
                                        secureTextEntry={hidePassword}
                                        isPassword={true}
                                        hidePassword={hidePassword}
                                        setHidePassword={setHidePassword}
                                    />
                                )}
                                
                                {!isSubmitting && 
                                    <StyledButton onPress={handleSubmit} background={theme == "light" ? colors.mediumRed : colors.darkRed}>
                                        <ButtonText color={colors.white}>Entrar</ButtonText>
                                    </StyledButton>
                                }

                                {isSubmitting && 
                                    <StyledButton disabled={true} background={theme == "light" ? colors.mediumRed : colors.darkRed}>
                                        <ActivityIndicator size="large" color={colors.white}/>
                                    </StyledButton>
                                }

                                <Line color={colors.text}/>

                                <ExtraView isReceiveCode={true}>
                                    <ExtraText color={colors.text}>Ainda não possui uma conta? </ExtraText>
                                    <TextLink onPress={() => navigation.navigate("RequestLogin")}>
                                        <TextLinkContent color={colors.text}>Clique aqui</TextLinkContent>
                                    </TextLink>
                                </ExtraView>
                            </StyledFormArea>
                        )}
                    </Formik>
                </InnerContainer>
            </FundoApp>
        </KeyboardProperlyWorking>
    );
};

export default Login;