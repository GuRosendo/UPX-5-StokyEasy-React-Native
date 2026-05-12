import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, Pressable } from "react-native";
import Modal from "react-native-modal";
import { Calendar, LocaleConfig } from "react-native-calendars";

import { useTheme } from "../ThemeContext";
import {
    ModalContainer,
    StyledTextInput,
    TextDateModal,
    YearItem,
    YearSelector,
    YearText
} from "../../components/general/styles";

import {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today
} from "../dateNames/dateNamesPtBr";

// Locale
LocaleConfig.locales["pt-br"] = {
    monthNames,
    monthNamesShort,
    dayNames,
    dayNamesShort,
    today,
};
LocaleConfig.defaultLocale = "pt-br";

const ITEM_HEIGHT = 48;

export const DateTimePickerCustom = ({
    setDateSelected,
    useTodayAsMin,
    useTodayAsMax,
    useTodayAsDefaultValue,
    initialDate,   // <-- novo: string ISO "YYYY-MM-DD" ou timestamp (number) para pré-popular
    ...props
}) => {
    const { theme, themeColors } = useTheme();
    const colors = themeColors[theme];

    const todayDate = new Date();
    const todayString = todayDate.toISOString().split("T")[0];

    const currentYear = todayDate.getFullYear();
    const minYear = currentYear - 150;
    const maxYear = currentYear + 150;

    // Resolve a data inicial: initialDate > useTodayAsDefaultValue > fallback
    const resolveInitialISO = () => {
        if (initialDate) {
            if (typeof initialDate === "number") {
                return new Date(initialDate).toISOString().split("T")[0];
            }
            if (typeof initialDate === "string" && initialDate.length >= 10) {
                return initialDate.slice(0, 10);
            }
        }
        if (useTodayAsDefaultValue) return todayString;
        return "2000-01-01";
    };

    const initialISO = resolveInitialISO();
    const parsedInit = new Date(initialISO + "T00:00:00");

    const [date, setDate] = useState(initialISO);
    const [show, setShow] = useState(false);
    const [yearSelector, setYearSelector] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(parsedInit.getMonth() + 1);
    const [calendarYear,  setCalendarYear]  = useState(parsedInit.getFullYear());

    // Sincroniza quando initialDate muda (ex: modal reabre com outra parcela)
    useEffect(() => {
        const iso = resolveInitialISO();
        setDate(iso);
        const d = new Date(iso + "T00:00:00");
        setCalendarMonth(d.getMonth() + 1);
        setCalendarYear(d.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialDate]);

    const flatListRef = useRef(null);

    const toggleDatePicker = () => setShow(prev => !prev);

    const onDayPress = (day) => {
        const [year, month, dayNum] = day.dateString.split("-").map(Number);
        const localDate = new Date(year, month - 1, dayNum);

        setDate(day.dateString);
        setDateSelected(localDate);
        setShow(false);
    };

    const handleYearSelect = (year) => {
        setCalendarYear(year);
        setYearSelector(false);
    };

    const generateYearList = () =>
        Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

    useEffect(() => {
        if (yearSelector && flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: calendarYear - minYear,
                animated: true,
                viewPosition: 0.5,
            });
        }
    }, [yearSelector]);

    const getCurrentMonthDate = (year, month) => {
        const paddedMonth = month.toString().padStart(2, "0");
        return `${year}-${paddedMonth}-01`;
    };

    return (
        <View>
            <Modal
                isVisible={show}
                onBackdropPress={toggleDatePicker}
                backdropOpacity={0.5}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
            >
                <ModalContainer background={colors.background}>
                    
                    <YearSelector onPress={() => setYearSelector(true)}>
                        <TextDateModal color={colors.text}>
                            {calendarYear}
                        </TextDateModal>
                    </YearSelector>

                    {!yearSelector ? (
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
                                    selectedColor:
                                        theme === "light"
                                            ? colors.mediumRed
                                            : colors.darkRed,
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
                                todayTextColor:
                                    theme === "light"
                                        ? colors.mediumRed
                                        : colors.darkRed,
                                monthTextColor: colors.text,
                                arrowColor:
                                    theme === "light"
                                        ? colors.mediumRed
                                        : colors.darkRed,
                                textDisabledColor: colors.grey,
                            }}
                        />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={generateYearList()}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <YearItem
                                    height={ITEM_HEIGHT}
                                    onPress={() => handleYearSelect(item)}
                                >
                                    <YearText color={colors.text}>
                                        {item}
                                    </YearText>
                                </YearItem>
                            )}
                            getItemLayout={(data, index) => ({
                                length: ITEM_HEIGHT,
                                offset: ITEM_HEIGHT * index,
                                index,
                            })}
                        />
                    )}
                </ModalContainer>
            </Modal>

            <Pressable onPress={toggleDatePicker}>
                <StyledTextInput
                    {...props}
                    placeholderTextColor={props.placeholderTextColor ?? colors.text + "66"}
                    value={
                        props.value && props.value.length > 0
                            ? props.value
                            : date && date.length === 10
                                ? date.split("-").reverse().join("/")
                                : date
                    }
                    editable={false}
                />
            </Pressable>
        </View>
    );
};