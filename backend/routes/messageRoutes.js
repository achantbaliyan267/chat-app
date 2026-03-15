const express = require("express");
const route = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");

// Send Message Route
route.post("/send/:reciverId", protect, sendMessage);

// Message List
route.get("/:userId", protect, getMessages);

module.exports = route;
