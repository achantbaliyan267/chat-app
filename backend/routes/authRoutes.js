const express = require("express");
const router = express.Router();

const { signup, login, guestLogin } = require("../controllers/authController");

// Sign Up Router
router.post("/signup", signup);

// Login Router
router.post("/login", login);

// Guest Login Router
router.post("/guest-login", guestLogin);

module.exports = router;
