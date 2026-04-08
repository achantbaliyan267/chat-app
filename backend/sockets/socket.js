const Message = require("../models/Message");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);

      socket.broadcast.emit("userOnline", userId);
    });

    socket.on("sendMessage", async (message) => {
      // Message is already saved in the DB by the REST API, just forward it to the receiver's socket room
      const receiverId = message.reciver || message.receiver;
      if (receiverId) {
         io.to(receiverId.toString()).emit("receiveMessage", message);
      }
    });

    socket.on("messageDelivered", async (messageId) => {
      await Message.findByIdAndUpdate(messageId, {
        status: "delivered",
      });
    });

    socket.on("messageRead", async (messageId) => {
      await Message.findByIdAndUpdate(messageId, {
        status: "read",
      });
    });

    socket.on("disconnect", () => {
      const rooms = [...socket.rooms];

      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.broadcast.emit("userOffline", room);
        }
      });

      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
