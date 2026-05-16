import React from 'react';
import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import {
    InnerContainer,
    StyledFormArea,
    StyledButton,
    ButtonText,
    FundoApp,
    Line,
    ExtraView,
    ExtraText,
    TextLink,
    TextLinkContent,
} from '../../components/general/styles';
import { Input } from '../../components/general/Input';
import KeyboardProperlyWorking from '../../components/general/KeyboardProperlyWorking';
import { formatDate, formatCellphone } from '../../functions/general/Masks';
import { useTheme } from '../../components/ThemeContext';
import { useForgotPassword, STEP } from './useForgotPassword';

const ForgotPassword = ({ navigation }) => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    const {
        step, loading,
        celular, setCelular,
        email, setEmail,
        dateSelected, setDateSelected,
        handleVerify,
        newPass,     setNewPass,
        confirmPass, setConfirmPass,
        hideNew,     setHideNew,
        hideConfirm, setHideConfirm,
        handleSaveNewPassword,
        reset,
    } = useForgotPassword();

    const onSavePassword = async () => {
        const ok = await handleSaveNewPassword();
        if (ok) {
            reset();
            navigation.navigate('Login');
        }
    };

    return (
        <KeyboardProperlyWorking isScrollView={true}>
            <FundoApp style={{ marginBottom: 130 }}>
                <InnerContainer>
                    <Image
                        source={require('../../assets/images/logoStokyEasySmaller.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {step === STEP.VERIFY && (
                        <StyledFormArea RequestLoginForm={true}>
                            <Input
                                label="Número de Celular"
                                placeholder="Digite seu número de celular"
                                icon="phone"
                                placeholderTextColor={colors.text}
                                onChangeText={(v) => setCelular(formatCellphone(v, true))}
                                value={formatCellphone(celular, true)}
                                keyboardType="numeric"
                            />

                            <Input
                                label="Email"
                                placeholder="Digite seu Email"
                                icon="at"
                                placeholderTextColor={colors.text}
                                onChangeText={setEmail}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Input
                                label="Data de Nascimento"
                                placeholder="Informe sua data de nascimento"
                                icon="calendar-day"
                                placeholderTextColor={colors.text}
                                value={dateSelected ? formatDate(dateSelected, 'BR', false) : ''}
                                isDate={true}
                                editable={false}
                                useTodayAsMin={false}
                                useTodayAsMax={true}
                                useTodayAsDefaultValue={!dateSelected}
                                setDateSelected={setDateSelected}
                            />

                            {!loading && (
                                <StyledButton
                                    onPress={handleVerify}
                                    FormRequestLogin={true}
                                    background={theme === 'light' ? colors.mediumRed : colors.darkRed}
                                >
                                    <ButtonText color={colors.white}>Verificar dados</ButtonText>
                                </StyledButton>
                            )}

                            {loading && (
                                <StyledButton
                                    disabled={true}
                                    FormRequestLogin={true}
                                    background={theme === 'light' ? colors.mediumRed : colors.darkRed}
                                >
                                    <ActivityIndicator size="large" color={colors.white} />
                                </StyledButton>
                            )}

                            <Line color={colors.text} />

                            <ExtraView>
                                <ExtraText color={colors.text}>Lembrou a senha? </ExtraText>
                                <TextLink onPress={() => { reset(); navigation.navigate('Login'); }}>
                                    <TextLinkContent color={colors.text}>Entrar</TextLinkContent>
                                </TextLink>
                            </ExtraView>
                        </StyledFormArea>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        STEP 2 — Nova senha
                    ══════════════════════════════════════════════════════ */}
                    {step === STEP.NEW_PASS && (
                        <StyledFormArea RequestLoginForm={true}>
                            <Input
                                label="Nova senha"
                                icon="user-lock"
                                placeholder="Mínimo 8 caracteres"
                                placeholderTextColor={colors.text}
                                onChangeText={setNewPass}
                                value={newPass}
                                secureTextEntry={hideNew}
                                isPassword={true}
                                hidePassword={hideNew}
                                setHidePassword={setHideNew}
                            />

                            <Input
                                label="Repita a nova senha"
                                icon="user-lock"
                                placeholder="Confirme sua nova senha"
                                placeholderTextColor={colors.text}
                                onChangeText={setConfirmPass}
                                value={confirmPass}
                                secureTextEntry={hideConfirm}
                                isPassword={true}
                                hidePassword={hideConfirm}
                                setHidePassword={setHideConfirm}
                            />

                            {!loading && (
                                <StyledButton
                                    onPress={onSavePassword}
                                    FormRequestLogin={true}
                                    background={theme === 'light' ? colors.mediumRed : colors.darkRed}
                                >
                                    <ButtonText color={colors.white}>Salvar nova senha</ButtonText>
                                </StyledButton>
                            )}

                            {loading && (
                                <StyledButton
                                    disabled={true}
                                    FormRequestLogin={true}
                                    background={theme === 'light' ? colors.mediumRed : colors.darkRed}
                                >
                                    <ActivityIndicator size="large" color={colors.white} />
                                </StyledButton>
                            )}

                            <Line color={colors.text} />

                            <ExtraView>
                                <ExtraText color={colors.text}>Lembrou a senha? </ExtraText>
                                <TextLink onPress={() => { reset(); navigation.navigate('Login'); }}>
                                    <TextLinkContent color={colors.text}>Entrar</TextLinkContent>
                                </TextLink>
                            </ExtraView>
                        </StyledFormArea>
                    )}

                </InnerContainer>
            </FundoApp>
        </KeyboardProperlyWorking>
    );
};

const styles = StyleSheet.create({
    logo: {
        width: 180,
        height: 180,
        marginBottom: 15,
    },
});

export default ForgotPassword;