const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connnectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./sockets/socket");

// create express app
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connnectDB();

// Connectiong Frontend to Backend
app.use(cors());

// Use Middleware to Parse req Body content
app.use(express.json());

// Create HTTP server and Socket.IO server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket.IO connection handler
socketHandler(io);

// Auth Routes
app.use("/api/auth", authRoutes);

// Users Routes
app.use("/api/users", userRoutes);

// Message Routes
app.use("/api/messages/", messageRoutes);

// Protected Route Example
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user,
  });
});

// Serve static files from the React frontend app
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Triggering nodemon restart for user
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
