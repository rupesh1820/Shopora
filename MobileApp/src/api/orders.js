import apiClient from "./client";

export const createOrder = async (userId, orderData) => {
  const res = await apiClient.post(`/api/orders/${userId}/create`, orderData);
  return res.data;
};

export const getUserOrders = async (userId) => {
  const res = await apiClient.get(`/api/orders/${userId}`);
  return res.data.orders || [];
};

export const getOrderById = async (orderId) => {
  const res = await apiClient.get(`/api/orders/single/${orderId}`);
  return res.data.order;
};
