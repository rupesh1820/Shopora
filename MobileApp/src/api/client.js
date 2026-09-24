import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 80000, // 80s for Render free tier cold-starts
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically inject JWT token from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Error reading token from AsyncStorage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatic Retry interceptor for Render cold starts & transient network failures
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Track retry count on config object
    config._retryCount = config._retryCount || 0;

    const isNetworkError = !error.response || error.code === "ECONNABORTED" || error.message?.includes("Network Error");
    const isServerError = error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504);

    if (config._retryCount < 2 && (isNetworkError || isServerError)) {
      config._retryCount += 1;
      console.warn(`[Shopara API] Retrying request (${config._retryCount}/2):`, config.url);
      
      // Delay before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000 * config._retryCount));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
