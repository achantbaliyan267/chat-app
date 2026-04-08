import { io } from "socket.io-client";

// Use environment variable for backend URL if in production (e.g. Render/Vercel)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});
