import React, { useState, useEffect, useRef } from "react";

import { Modal, TouchableWithoutFeedback, View, FlatList, Pressable } from "react-native";

import { Calendar, LocaleConfig } from "react-native-calendars";

import { useTheme } from "../ThemeContext";

import { ModalBackground, ModalContainer, StyledTextInput, TextDateModal, YearItem, YearSelector, YearText } from "../../components/general/styles";

import { monthNames, monthNamesShort, dayNames, dayNamesShort, today } from "../dateNames/dateNamesPtBr";

//Configuração de idioma PT-BR (Data)
LocaleConfig.locales["pt-br"] = {
    monthNames: monthNames,
    monthNamesShort: monthNamesShort,
    dayNames: dayNames,
    dayNamesShort: dayNamesShort,
    today: today,
};

LocaleConfig.defaultLocale = "pt-br";

const ITEM_HEIGHT = 48;

export const DateTimePickerCustom = ({setDateSelected, useTodayAsMin, useTodayAsMax, useTodayAsDefaultValue, ...props}) => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    const currentYear = today.getFullYear();

    const minYear = currentYear - 150; //-150 anos da data atual
    const maxYear = currentYear + 150; //+150 anos da data atual

    const [date, setDate] = useState(useTodayAsDefaultValue ? todayString : "2000-01-01");
    const [show, setShow] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(useTodayAsDefaultValue ? today.getMonth() + 1 : 1);

    const [yearModalVisible, setYearModalVisible] = useState(false);
    const [calendarYear, setCalendarYear] = useState(useTodayAsDefaultValue ? today.getFullYear() : 2000);

    const toggleDatePicker = () => {
        setShow(!show);
    }

    const onDayPress = (day) => {
        const [year, month, dayNum] = day.dateString.split("-").map(Number);

        const localDate = new Date(year, month - 1, dayNum);

        setDate(day.dateString);
        setDateSelected(localDate);
        toggleDatePicker();
    };

    const toggleYearSelector = () => {
        setYearModalVisible(!yearModalVisible);
    }

    const handleYearSelect = (year) => {
        setCalendarYear(year);
        toggleYearSelector();
    };

    const renderYearItem = ({ item }) => (
        <YearItem height={ITEM_HEIGHT} onPress={() => handleYearSelect(item)}>
            <YearText color={colors.text}>{item}</YearText>
        </YearItem>
    );

    const getCurrentMonthDate = (year, month) => {
        const paddedMonth = month.toString().padStart(2, "0");
        return `${year}-${paddedMonth}-01`;
    };

    const generateYearList = () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

    const flatListRef = useRef(null);

    useEffect(() => {
        if(yearModalVisible && flatListRef.current){
            flatListRef.current.scrollToIndex({
                index: calendarYear - minYear,
                animated: true,
                viewPosition: 0.5, 
            });
        }
    }, [calendarYear, yearModalVisible]);

    return (
        <View>
            <Modal visible={show} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={toggleDatePicker}>
                    <ModalBackground>
                        <TouchableWithoutFeedback>
                            <ModalContainer background={colors.background}>
                                <YearSelector onPress={toggleYearSelector}>
                                    <TextDateModal color={colors.text}>
                                        {calendarYear}
                                    </TextDateModal>
                                </YearSelector>

                                <Calendar
                                    key={`calendar-${calendarYear}`}
                                    onDayPress={onDayPress}
                                    current={getCurrentMonthDate(calendarYear, calendarMonth)}

                                    onMonthChange={(month) => {
                                        setCalendarYear(month.year);
                                        setCalendarMonth(month.month);
                                    }}

                                    markedDates={{
                                        [date]: {
                                            selected: true,
                                            selectedColor: theme == "light" ? colors.mediumRed : colors.darkRed,
                                            selectedTextColor: colors.white,
                                        },
                                    }}

                                    minDate={useTodayAsMin ? todayString : undefined}
                                    maxDate={useTodayAsMax ? todayString : undefined}

                                    theme={{
                                        backgroundColor: colors.background,
                                        calendarBackground: colors.background,
                                        textSectionTitleColor: colors.text,
                                        dayTextColor: colors.text,
                                        todayTextColor: theme == "light" ? colors.mediumRed : colors.darkRed,
                                        selectedDayTextColor: colors.white,
                                        monthTextColor: colors.text,
                                        arrowColor: theme == "light" ? colors.mediumRed : colors.darkRed,
                                        textDisabledColor: colors.grey,
                                    }}
                                />
                            </ModalContainer>
                        </TouchableWithoutFeedback>
                    </ModalBackground>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={yearModalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={toggleYearSelector}>
                    <ModalBackground>
                        <TouchableWithoutFeedback>
                            <ModalContainer background={colors.background} yearModal={true}>
                                <FlatList
                                    ref={flatListRef}
                                    data={generateYearList()}
                                    keyExtractor={(item) => item.toString()}
                                    renderItem={renderYearItem}

                                    onLayout={() => {
                                        flatListRef.current?.scrollToIndex({
                                            index: calendarYear - minYear,
                                            animated: true,
                                            viewPosition: 0.5,
                                        });
                                    }}

                                    getItemLayout={(data, index) => ({
                                        length: ITEM_HEIGHT,
                                        offset: ITEM_HEIGHT * index,
                                        index,
                                    })}
                                />
                            </ModalContainer>
                        </TouchableWithoutFeedback>
                    </ModalBackground>
                </TouchableWithoutFeedback>
            </Modal>

            <Pressable onPress={toggleDatePicker}>
                <StyledTextInput
                    value={date}
                    editable={false}
                    {...props}
                />
            </Pressable>
        </View>
    );
};
