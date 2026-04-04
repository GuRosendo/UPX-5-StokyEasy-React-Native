import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {
    InnerContainer,
    StyledFormArea,
    StyledButton,
    ButtonText,
    Cores,
    FundoApp,
    Line,
    ExtraView,
    ExtraText,
    TextLink,
    TextLinkContent
} from '../components/general/styles';
//form config/data
import { Formik } from 'formik';
//inputs
import { Input } from '../components/general/Input';
//color
const { preto, secundaria } = Cores;
//fix bug on keyboard
import KeyboardProperlyWorking from './../components/general/KeyboardProperlyWorking';
//validations
import { handleRequestLogin } from '../functions/RequestLogin';
//sex options
import { sexo } from '../assets/data/options';
//function format date BR
import { formatDate } from '../functions/general/Masks';
//formats strings 
import { formatWeight, formatHeight, formatCellphone } from '../functions/general/Masks';
import { LogoCustom } from '../components/general/LogoCustom';

import { useTheme } from '../components/ThemeContext';

const RequestLogin = ({ navigation }) => {
    const [hasNumber, setHasNumber] = useState(true);
    const [numeroResidencia, setNumeroResidencia] = useState("");

    const { theme, themeColors } = useTheme();
                
    const colors = themeColors[theme];

    //selected sex value
    const [sexSelected, setSexSelected] = useState("");

    useEffect(() => {
        if(!hasNumber){
            setNumeroResidencia('Sem número');
        }
        
        if(hasNumber){
            setNumeroResidencia("");
        }
    }, [hasNumber]);

    //date of birth
    const [dateSelected, setDateSelected] = useState("");

    const [hidePassword, setHidePassword] = useState(true);
    const [hideRepeatPassword, setHideRepeatPassword] = useState(true);

    return (
        <KeyboardProperlyWorking isScrollView={true}>
            <FundoApp style={{marginBottom: 130}}>
                <InnerContainer>
                    <LogoCustom bottom={false} />

                    <Formik
                        initialValues={{
                            nomeCompleto: "", sexo: "", celular: "", dataNascimento: "", email: "", password: "", repeatedPassword: ""
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);

                            values = { 
                                ...values, 
                                sexo: sexSelected, 
                                dataNascimento: formatDate(dateSelected, "EUA", true), //Date value, format, return time
                            };

                            setTimeout(async() => { 
                                if(await handleRequestLogin(values)){
                                    navigation.navigate("Login")
                                }
                                setSubmitting(false);
                            }, 2000);
                        }}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, isSubmitting }) => (
                            <StyledFormArea RequestLoginForm={true}>
                                <Input
                                    label="Nome Completo"
                                    placeholder="Digite seu nome completo"
                                    icon="user-large"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('nomeCompleto')}
                                    value={values.nomeCompleto}
                                />
                                <Input
                                    label="Sexo"
                                    placeholder="Informe seu sexo"
                                    icon="genderless"
                                    placeholderTextColor={colors.text}
                                    //dropdown properties
                                    rightIcon="chevron-down"
                                    isDropdown={true}
                                    canSearch={false}
                                    dropdownHeight={300}
                                    dropdownData={sexo}
                                    searchInputPlaceholder={"Pesquisar"}
                                    arrowAlign={true}
                                    saveType={"text"} //Returns one index of your data
                                    textShow={"text"} //Shows one index of your data
                                    onSelect={setSexSelected}
                                    onSelectText={"text"} //Shows one index of your data when selected
                                    scrollEnabled={false}
                                />
                                <Input
                                    label="Número de Celular"
                                    placeholder="Digite seu número de celular"
                                    icon="phone"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('celular')}
                                    value={formatCellphone(values.celular, true)}
                                    keyboardType="numeric"
                                />
                                <Input
                                    label="Data de Nascimento"
                                    placeholder="Informe sua data de nascimento"
                                    icon="calendar-day"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('dataNascimento')}
                                    value={dateSelected ? formatDate(dateSelected, "BR", false) : ""}
                                    isDate={true}
                                    editable={false}
                                    keyboardType="numeric"
                                    useTodayAsMin={false}
                                    useTodayAsDefaultValue={true}
                                    setDateSelected={setDateSelected}
                                />
                                <Input
                                    label="Email"
                                    placeholder="Digite seu Email"
                                    icon="at"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('email')}
                                    value={values.email}
                                />
                                <Input
                                    label="Digite sua senha"
                                    icon="user-lock"
                                    placeholder="Informe sua senha"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('password')}
                                    value={values.password}
                                    secureTextEntry={hideRepeatPassword}
                                    isPassword={true}
                                    hidePassword={hideRepeatPassword}
                                    setHidePassword={setHideRepeatPassword}
                                />
                                <Input
                                    label="Repita sua senha"
                                    icon="user-lock"
                                    placeholder="Informe novamente sua senha"
                                    placeholderTextColor={colors.text}
                                    onChangeText={handleChange('repeatedPassword')}
                                    value={values.repeatedPassword}
                                    secureTextEntry={hidePassword}
                                    isPassword={true}
                                    hidePassword={hidePassword}
                                    setHidePassword={setHidePassword}
                                />
                                {!isSubmitting &&
                                    <StyledButton onPress={handleSubmit} FormRequestLogin={true} background={theme == "light" ? colors.mediumRed : colors.darkRed}>
                                        <ButtonText color={colors.white}>Criar Conta</ButtonText>
                                    </StyledButton>
                                }

                                {isSubmitting &&
                                    <StyledButton disabled={true} FormRequestLogin={true} background={theme == "light" ? colors.mediumRed : colors.darkRed}>
                                        <ActivityIndicator size="large" color={colors.white} />
                                    </StyledButton>
                                }

                                <Line color={colors.text}/>

                                <ExtraView>
                                    <ExtraText color={colors.text}>Não era o que você estava procurando? </ExtraText>
                                    <TextLink onPress={() => navigation.goBack()}>
                                        <TextLinkContent color={colors.text}>Voltar</TextLinkContent>
                                    </TextLink>
                                </ExtraView>

                            </StyledFormArea>
                        )}
                    </Formik>
                </InnerContainer>
            </FundoApp>
        </KeyboardProperlyWorking>
    );
}

export default RequestLogin;
