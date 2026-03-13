const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.signup = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    // Checking user exists or not
    const userExist = await User.findOne({
      $or: [{ email }, { username }],
    });

    // If exist then
    if (userExist) {
      return res.send(400).json({
        message: "User already exists",
      });
    }

    //  If not Exists
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      phone,
    });

    // Creating JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECERT, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user,
      message: "User Registerd Successfully",
    });
  } catch (err) {
    res.status(500).json({
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

    // If User not exists
    if (!user) {
      res.status(400).json({
        message: "User not Found",
      });
    }

    // If exists
    const passMatch = await bcrypt.compare(password, user.password);

    // If password not Match
    if (!passMatch) {
      res.status(400).json({
        message: "Invaild Credentaials",
      });
    }

    // If password Match
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECERT, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
