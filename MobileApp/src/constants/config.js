import { Platform } from "react-native";

// Machine's local Wi-Fi IP for physical phones & Expo Go testing
const LAN_IP = "10.29.51.38";
const PORT = "3000";

export const API_BASE_URL = Platform.select({
  android: `http://${LAN_IP}:${PORT}`,
  ios: `http://${LAN_IP}:${PORT}`,
  default: `http://localhost:${PORT}`,
});

export const APP_NAME = "Shopara";
export const CURRENCY_SYMBOL = "₹";
