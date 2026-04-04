import React, { forwardRef } from 'react';
import { View } from 'react-native';
import {
    LeftIcon,
    StyledTextInput,
    StyledInputLabel,
    RightIcon,
} from '../../components/general/styles';

import { DateTimePickerCustom } from './DateTimePickerCustom';

// icons
import { FontAwesome6 } from '@expo/vector-icons';
import { Dropdown } from './Dropdown';

import { useTheme } from '../ThemeContext';

const Input = forwardRef(({ label, isPassword, icon, rightIcon, isResidenceNumber, hasNumber, setHasNumber, hidePassword, setHidePassword, onFocus, onBlur, isDate, setDateSelected, useTodayAsMin, useTodayAsMax, useTodayAsDefaultValue, isDropdown, canSearch, dropdownHeight, dropdownData, searchInputPlaceholder, arrowAlign, saveType, textShow, scrollEnabled, onSelectText, multiline, ...props }, ref) => {
    const { theme, themeColors } = useTheme();

    const colors = themeColors[theme];

    return (
        <View>
            {!isDropdown && (
                <LeftIcon FontAwesome={true}>
                    <FontAwesome6 name={icon} size={25} color={colors.mediumRed} />
                </LeftIcon>
            )}

            {!isDropdown && <StyledInputLabel color={colors.text} BiggerLabel={true}>{label}</StyledInputLabel>}

            {(!isDate && !isDropdown) && 
                <StyledTextInput 
                    {...props}
                    secureTextEntry={isPassword ? hidePassword : false}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    ref={ref} 
                    multiline={multiline}
                    color={colors.text}
                    background={colors.card}
                    autoCapitalize={isPassword ? "none" : undefined}
                />
            }

            {isPassword && (
                <RightIcon onPress={() => setHidePassword(!hidePassword)} FontAwesome={true}>
                    <FontAwesome6 name={hidePassword ? 'eye' : 'eye-slash'} size={25} color={colors.mediumRed} />
                </RightIcon>
            )}

            {isResidenceNumber && (
                <RightIcon onPress={() => setHasNumber(!hasNumber)} FontAwesome={true} isResidenceNumber={isResidenceNumber}>
                    <FontAwesome6 name={rightIcon} size={25} color={colors.mediumRed} />
                </RightIcon>
            )}

            {isDate && (
                <DateTimePickerCustom 
                    {...props}
                    setDateSelected={setDateSelected}
                    useTodayAsMin={useTodayAsMin}
                    useTodayAsMax={useTodayAsMax}
                    useTodayAsDefaultValue={useTodayAsDefaultValue}
                    background={colors.card}
                    color={colors.text}
                />
            )}

            {isDropdown && 
                <Dropdown 
                    {...props} 
                    icon={icon} 
                    label={label} 
                    rightIcon={rightIcon} 
                    canSearch={canSearch} 
                    dropdownHeight={dropdownHeight} 
                    dropdownData={dropdownData} 
                    searchInputPlaceholder={searchInputPlaceholder} 
                    arrowAlign={arrowAlign} 
                    saveType={saveType} 
                    textShow={textShow}
                    onSelectText={onSelectText}
                    value={props.value}
                    scrollEnabled={scrollEnabled}
                />
            }       
        </View>
    );
});

export { Input };
