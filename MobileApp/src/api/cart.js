import apiClient from "./client";

export const getCart = async (userId) => {
  const res = await apiClient.get(`/api/cart/${userId}`);
  return res.data.cart;
};

export const addToCart = async (userId, { productId, quantity = 1, selectedSize, selectedColor }) => {
  const res = await apiClient.post(`/api/cart/${userId}/add`, {
    productId,
    quantity,
    selectedSize,
    selectedColor,
  });
  return res.data.cart;
};

export const updateCartItem = async (userId, productId, { quantity, selectedSize, selectedColor }) => {
  const res = await apiClient.put(`/api/cart/${userId}/update/${productId}`, {
    quantity,
    selectedSize,
    selectedColor,
  });
  return res.data.cart;
};

export const removeCartItem = async (userId, productId) => {
  const res = await apiClient.delete(`/api/cart/${userId}/remove/${productId}`);
  return res.data.cart;
};

export const clearCart = async (userId) => {
  const res = await apiClient.delete(`/api/cart/${userId}/clear`);
  return res.data.cart;
};
