const Message = require("../models/Message");

const onlineUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log("Online users:", onlineUsers);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, text } = data;

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const receiverSocketId = onlineUsers[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
    });

    socket.on("disconnect", () => {
      for (let userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
        }
      }

      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
