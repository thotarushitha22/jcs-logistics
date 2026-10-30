import api from "./api";

export const fetchAllOrders = async () => {
  try {
    const response = await api.get("/orders/all"); 
    return response.data?.orders || response.data?.data || response.data || [];
  } catch (err) {
    return [];
  }
};

export const fetchAllProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data?.products || response.data?.data || response.data || [];
  } catch (err) {
    return [];
  }
};

// UPDATED: Tries the working endpoint first to prevent 404 console errors
export const fetchAllUsers = async () => {
  // Try the known working route first
  try {
    const response = await api.get("/admin/users");
    const data = response.data?.users || response.data?.data || response.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    // If admin route fails, silently fall back
  }

  // Fallback to standard route
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