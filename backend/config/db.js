const mongoose = require("mongoose");

// Creating connection to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    console.log(`MongoDB connnected: ${conn.connection.host}`);
  } catch (err) {
    console.error("Database connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
