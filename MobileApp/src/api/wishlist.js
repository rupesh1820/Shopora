import apiClient from "./client";

export const getWishlist = async (userId) => {
  const res = await apiClient.get(`/api/wishlist/${userId}`);
  return res.data.wishlist?.products || [];
};

export const addToWishlist = async (userId, productId) => {
  const res = await apiClient.post(`/api/wishlist/${userId}/add`, { productId });
  return res.data;
};

export const removeFromWishlist = async (userId, productId) => {
  const res = await apiClient.delete(`/api/wishlist/${userId}/remove/${productId}`);
  return res.data;
};
