const User = require("../models/User");

exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          username: {
            $regex: req.query.search,
            $options: "i",
          },
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user } })
      .select("-password");
    console.log("users:", users);

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Unable to search users",
    });
  }
};
