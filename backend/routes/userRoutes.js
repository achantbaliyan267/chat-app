const express = require("express");
const router = express.Router();

const {
  searchUsers,
  sendFriendRequest,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

// User search route
router.get("/search", protect, searchUsers);

// Friend request route
router.post("/send-request/:id", protect, sendFriendRequest);

module.exports = router;
