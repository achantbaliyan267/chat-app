const User = require("../models/User");

//   Search users
exports.searchUsers = async (req, res) => {
  try {
    // Create a search keyword based on the query parameter
    const keyword = req.query.search
      ? {
          username: {
            $regex: req.query.search,
            $options: "i",
          },
        }
      : {};

    let query = keyword;
    if (req.user) {
      query._id = { $ne: req.user };
    }

    // Find users matching the keyword, excluding the current user and selecting all fields except password
    const users = await User.find(query).select("-password");

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Unable to search users",
    });
  }
};

// Friend Request
exports.sendFriendRequest = async (req, res) => {
  try {
    // Get receiver and sender IDs
    const receiverId = req.params.id;
    const senderId = req.user;

    // Check if sender is trying to send a friend request to themselves
    if (receiverId === senderId) {
      return res.status(400).json({
        message: "Error, You can't send request to Yourself",
      });
    }

    // Find the receiver in the database
    const receiver = await User.findById(receiverId);

    // Check if receiver exists
    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //  Check if a friend request has already been sent
    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    // Add sender's ID to the receiver's friend requests and save the receiver
    receiver.friendRequests.push(senderId);
    await receiver.save();

    // Return success response
    res.json({
      message: "Friend request sent",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  try {
    // Get sender and current user IDs
    const senderUserId = req.params.id;
    const currentUserId = req.user;

    // Find sender and current user in the database
    const sender = await User.findById(senderUserId);
    const currentUser = await User.findById(currentUserId);

    // Check if sender and current user exist
    if (!sender || !currentUser) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    // Check if there is a friend request from the sender to the current user
    if (!currentUser.friendRequests.includes(senderUserId)) {
      return res.status(400).json({
        message: "No Friend Request from this User",
      });
    }

    // Remove the sender's ID from the current user's friend requests and add each other to friends list
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== senderUserId,
    );

    // Add each other to friends list
    currentUser.friends.push(senderUserId);
    sender.friends.push(currentUserId);

    await currentUser.save();
    await sender.save();

    // Return success response
    res.json({
      message: "Friend Request accepted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Some error occurred while accepting friend request",
    });
  }
};

// Reject Friend Request
exports.rejectFriendRequest = async (req, res) => {
  try {
    // Get sender and current user IDs
    const senderId = req.params.id;
    const currenUserId = req.user;

    // Find sender and current user in the database
    const currentUser = await User.findById(currenUserId);

    // Check if sender and current user exist
    if (!currentUser) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    // Check if there is a friend request from the sender to the current user
    if (!currentUser.friendRequests.includes(senderId)) {
      return res.status(400).json({
        message: "No friend request from this User",
      });
    }

    // Remove the sender's ID from the current user's friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== senderId,
    );

    await currentUser.save();

    // Return success response
    return res.json({
      message: "Request rejected Successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Get Friends List
exports.getFriendRequests = async (req, res) => {
  try {
    // Get current user ID
    const currentUserId = req.user;

    // Find current user in the database and populate friend requests with sender's name, email, and username
    const currentUser = await User.findById(currentUserId).populate(
      "friendRequests",
      "name email username",
    );

    // Check if current user exists
    if (!currentUser) {
      return res.status(404).json({ message: "User not Found" });
    }

    // Return the list of friend requests
    return res.json(currentUser.friendRequests);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Get Friends List
exports.getFriendsList = async (req, res) => {
  try {
    // Get current user ID
    const currentUserId = req.user;

    // Find current user in the database and populate friends with their name, username, and email
    const currentUser = await User.findById(currentUserId).populate(
      "friends",
      "name username email",
    );

    // Check if current user exists
    if (!currentUser) {
      return res.status(404).json({
        message: "User not Found",
      });
    }

    // Return the list of friends
    return res.json(currentUser.friends);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
