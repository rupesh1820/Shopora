export const getApiUrl = () => {
  const env = import.meta.env.VITE_SERVER || import.meta.env.VITE_API_URL;
  if (
    !env ||
    env === "undefined" ||
    env.includes("localhost") ||
    env.includes("127.0.0.1") ||
    env.includes("10.")
  ) {
    return "https://shopara-official.onrender.com";
  }
  return env.replace(/\/+$/, "");
};

export const API_URL = getApiUrl();
export default API_URL;
