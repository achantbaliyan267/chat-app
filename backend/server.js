const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connnectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

dotenv.config();

connnectDB();

// Connectiong Frontend to Backend
app.use(cors());

// Use Middleware to Parse req Body content
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("Home");
});

// Signup Route
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
