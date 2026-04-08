const Message = require("../models/Message");

const activeUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      activeUsers.set(userId, socket.id);
      
      // Broadcast everyone online
      io.emit("activeUsers", Array.from(activeUsers.keys()));
    });

    socket.on("sendMessage", async (message) => {
      const receiverId = message.reciver || message.receiver;
      if (receiverId) {
         io.to(receiverId.toString()).emit("receiveMessage", message);
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId.toString()).emit("typing", senderId);
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      if (receiverId) {
        io.to(receiverId.toString()).emit("stopTyping", senderId);
      }
    });

    socket.on("messageDelivered", async (messageId) => {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });
    });

    socket.on("messageRead", async (messageId) => {
      await Message.findByIdAndUpdate(messageId, { status: "read" });
    });

    socket.on("disconnect", () => {
      for (let [userId, sId] of activeUsers.entries()) {
        if (sId === socket.id) {
          activeUsers.delete(userId);
          io.emit("activeUsers", Array.from(activeUsers.keys()));
          break;
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
