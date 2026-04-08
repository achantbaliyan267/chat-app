const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.signup = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    // Check user exists
    const userExist = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
    });

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // ✅ FIXED
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      token,
      user: userObj,
      message: "User Registered Successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    // User not found
    if (!user) {
      return res.status(400).json({
        message: "User not Found",
      });
    }

    // Check password
    const passMatch = await bcrypt.compare(password, user.password);

    if (!passMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // ✅ FIXED
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};