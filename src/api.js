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

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    // DEV BYPASS: If we are on a new port and localStorage is empty,
    // we use a hardcoded token to bypass the login screen.
    if (!token) {
      // PASTE YOUR LONG TOKEN FROM THE MAIN JCS APP HERE:
      token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNz...PASTE_YOURS_HERE"; 
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login Function (kept here just in case you add it back later)
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