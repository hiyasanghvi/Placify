// src/api/opportunityApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://placify-ooic.onrender.com/api",
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const getPublicOpportunities = () =>
  API.get("/opportunities");
export const createOpportunity = (data) =>
  API.post("/placements", data);
