import Toast from "react-native-toast-message";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export function ToastPortal({ theme }) {
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#186C8C",
          backgroundColor: theme === "light" ? "#FFFFFF" : "#1E1E1E",
          borderLeftWidth: 7,
          width: "90%",
          height: 100,
        }}
        text1Style={{
          fontSize: 17,
          fontWeight: "700",
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
        text2Style={{
          fontSize: 14,
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        text2NumberOfLines={3}
        style={{
          borderLeftColor: "#A70000",
          backgroundColor: theme === "light" ? "#FFFFFF" : "#1E1E1E",
          borderLeftWidth: 7,
          width: "90%",
          height: 100,
        }}
        text1Style={{
          fontSize: 17,
          fontWeight: "700",
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
        text2Style={{
          fontSize: 14,
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#F4D03F",
          backgroundColor: theme === "light" ? "#FFFFFF" : "#1E1E1E",
          borderLeftWidth: 7,
          width: "90%",
          height: 100,
        }}
        text1Style={{
          fontSize: 17,
          fontWeight: "700",
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
        text2Style={{
          fontSize: 14,
          color: theme === "light" ? "#000000" : "#F2F0EF",
        }}
      />
    ),
  };

  return <Toast config={toastConfig} />;
}