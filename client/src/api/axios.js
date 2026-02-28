import axios from "axios";

// Use the environment variable from Vite
// client/src/api/api.js
const api = axios.create({
  baseURL: "https://placify-ooic.onrender.com/api", // deployed backend
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;
