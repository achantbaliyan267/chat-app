const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

// Guest Login - creates a temporary guest user with unique ID
exports.guestLogin = async (req, res) => {
  try {
    const guestId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const guestUsername = `guest_${guestId}`;
    const guestName = `Guest ${guestId.slice(0, 6).toUpperCase()}`;
    const guestEmail = `${guestUsername}@guest.chatapp.local`;
    const guestPhone = "0000000000";

    // Create a random password for the guest
    const randomPass = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPass, salt);

    const user = await User.create({
      name: guestName,
      username: guestUsername,
      email: guestEmail,
      phone: guestPhone,
      password: hashedPassword,
      isGuest: true,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      token,
      user: userObj,
      message: "Joined as Guest",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};