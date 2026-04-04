import { ImagesRow, PageTitle } from './styles';

import { useTheme } from '../ThemeContext';

import { StyleSheet, Image } from 'react-native';

export const LogoCustom = ({...props}) => {
    const { theme, themeColors } = useTheme();

    //const logoSource = theme === "light" ? require("../../assets/images/Logo.png") : require("../../assets/images/LogoLight.png");

    const logoSource = "";

    return(
        <>
            <ImagesRow bottom={props.bottom}>
                <Image
                    source={logoSource}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </ImagesRow>
        </>
    );
}

const styles = StyleSheet.create({
  logo: {
    width: 160,
    height: 160,
  },
});