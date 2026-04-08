const jwt = require("jsonwebtoken");

// Protect routes
const protect = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  // Check if token exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  // Verify token
  try {
    // Get token from header
    const token = authHeader.split(" ")[1];

    // Verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from token to req object
    req.user = decode.id;

    // Call next middleware
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);
    res.status(401).json({
      message: "Invaild Token",
      error: err.message
    });
  }
};

module.exports = protect;
