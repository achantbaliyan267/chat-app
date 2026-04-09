const express = require("express");
const route = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  markMessagesRead,
} = require("../controllers/messageController");

// Send Message Route
route.post("/send/:reciverId", protect, sendMessage);

// Message List
route.get("/:userId", protect, getMessages);

// Mark messages as read
route.put("/read/:senderId", protect, markMessagesRead);

module.exports = route;
