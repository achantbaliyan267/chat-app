import { io } from "socket.io-client";

// Use environment variable for backend URL if in production (e.g. Render/Vercel)
const BACKEND_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "https://chat-app-backend-6hur.onrender.com";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});
