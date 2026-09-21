import apiClient from "./client";

export const loginUser = async (email, password) => {
  const res = await apiClient.post("/api/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await apiClient.post("/api/auth/register", userData);
  return res.data;
};

export const verifyOtp = async (email, otp) => {
  const res = await apiClient.post("/api/auth/verify-otp", { email, otp });
  return res.data;
};
