import axios from "axios";

// Use the environment variable from Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // instead of localhost
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
