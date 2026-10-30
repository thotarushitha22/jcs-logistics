import api from "./api";

export const fetchAllOrders = async () => {
  try {
    const response = await api.get("/orders/all"); 
    return response.data?.orders || response.data?.data || response.data || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
};

export const fetchAllProducts = async () => {
  try {
    const response = await api.get("/products");
    const data = response.data?.products || response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    const data = response.data?.users || response.data?.data || response.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    // Ignore error and try fallback
  }

  try {
    const response = await api.get("/users");
    const data = response.data?.users || response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
  return response.data;
};