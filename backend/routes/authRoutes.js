const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/authController");

// Sign Up Router
router.post("/signup", signup);

module.exports = router;
