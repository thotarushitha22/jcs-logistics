import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://jcs-server-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    // FORCE THE MERCHANT TOKEN FOR CLOUDFLARE
    if (!token) {
      // Paste the NEW Merchant token here
      token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAsImVtYWlsIjoiMjIxQGdtYWlsLmNvbSIsInJvbGUiOiJtZXJjaGFudCIsImlhdCI6MTc5MzM0MTMzMCwiZXhwIjoxNzk1OTMzMzMwfQ.nFMbIlgswaM5_eX1rLub4zVseeEGq7B82LmjwCUpZ90"; 
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }
  if (response.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export default api;