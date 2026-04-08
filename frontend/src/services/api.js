import axios from "axios";

// Use environment variables for backend API URL
const BACKEND_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chat-app-backend-6hur.onrender.com";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
