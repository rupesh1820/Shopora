import apiClient from "./client";

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.append("category", params.category);
  if (params.gender) query.append("gender", params.gender);
  if (params.search) query.append("search", params.search);
  if (params.sale) query.append("sale", "true");

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const res = await apiClient.get(`/api/products${queryString}`);
  return res.data.products || res.data.data || [];
};

export const getProductById = async (id) => {
  const res = await apiClient.get(`/api/products/${id}`);
  return res.data.product || res.data.data;
};
