import React, { useEffect, useState } from "react";

import { TouchableOpacity, View } from "react-native";

import {
    LeftIcon,
    StyledTextInput,
    StyledInputLabel,
    RightIcon,
    DropdownArea,
    DropdownAreaFlatList,
    ItemsDropdown,
    ItemDropdownText,
} from './styles';

import { FontAwesome6 } from '@expo/vector-icons';

import { onSearch } from "../../functions/general/DropDownSearch";

import { useTheme } from "../ThemeContext";

export const Dropdown = ({onSelect, ...props}) => {
    const [selectedOption, setSelectedOption] = useState(props.value ? props.value : props.placeholder); //selected option on dropdown

    const [data, setData] = useState(props.dropdownData);

    const [texto, setTexto] = useState(''); //controls the search input and it's value

    const [clicked, setClicked] = useState(false); //controls dropdown

    const { theme, themeColors } = useTheme();

    const colors = themeColors[theme];

    useEffect(() => {
        setData(onSearch(texto, props.dropdownData)); 
    }, [texto]); //calls (filter search on dropdown)

    const handleSelect = (item) => {
        setSelectedOption(item[props.onSelectText]);
        setTexto('');
        setClicked(false);
        if (onSelect) {
            onSelect(item[props.saveType]); // Pass the selected item back to the parent
        }
    };

    return(
        <View>
            <LeftIcon FontAwesome={true}>
                <FontAwesome6 name={props.icon} size={25} color={colors.darkRed} />
            </LeftIcon>

            <RightIcon onPress={() => {setClicked(!clicked)}} FontAwesome={true} Arrow={props.arrowAlign} Rotate={clicked}>
                <FontAwesome6 name={props.rightIcon} size={16} color={colors.darkRed} />
            </RightIcon>

            <StyledInputLabel color={colors.text} BiggerLabel={true}>{props.label}</StyledInputLabel>

            <TouchableOpacity activeOpacity={1} onPress={() => {setClicked(!clicked)}}>
                <StyledTextInput 
                    editable={false} 
                    value={selectedOption} 
                    placeholder={selectedOption} 
                    placeholderTextColor={colors.text}
                    hasBorder={props.hasBorder}
                    borderColor={props.borderColor}
                    background={colors.card}
                    color={colors.text}
                />
            </TouchableOpacity>

            { clicked &&
                <DropdownArea dropdownHeight={props.dropdownHeight} isClicked={clicked} hasBorder={props.hasBorder} borderColor={props.borderColor} background={colors.card}>
                    <StyledTextInput 
                        placeholder={props.searchInputPlaceholder} 
                        placeholderTextColor={colors.text} 
                        canSearch={props.canSearch} 
                        onChangeText={text => {
                            setTexto(text);
                        }}
                        background={colors.card}
                        borderColor={colors.text}
                        color={colors.text}
                    />

                    <DropdownAreaFlatList 
                    data={data} 
                    scrollEnabled={props.scrollEnabled}
                    renderItem={({item, index}) => {
                        return(
                            <ItemsDropdown onPress={() => handleSelect(item)} borderColor={colors.text} background={colors.card}>
                                <ItemDropdownText color={colors.text}>{item[props.textShow]}</ItemDropdownText>
                            </ItemsDropdown>
                        )
                    }}/>
                </DropdownArea>
            }
        </View>
    )
}