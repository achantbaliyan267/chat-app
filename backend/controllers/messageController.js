const User = require("../models/User");
const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    // Get the reciverId from the request parameters and senderId from the authenticated user
    const reciverId = req.params.reciverId;
    const senderId = req.user;
    const { text, image } = req.body;

    // Validate the input
    if (!text && !image) {
      return res.status(400).json({
        message: "Text or Image is required",
      });
    }

    // Check if the reciver exists
    const reciver = await User.findById(reciverId);

    if (!reciver) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    // Create a new message
    const message = await Message.create({
      sender: senderId,
      reciver: reciverId,
      text: text || "",
      image: image || "",
    });

    // Return the created message
    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    // Get the other user's ID from the request parameters and the current user's ID from the authenticated user
    const otherUserId = req.params.userId;
    const currentUserId = req.user;

    // Collect all messages between the current user and the other user, sorted by creation time
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, reciver: otherUserId },
        { sender: otherUserId, reciver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
