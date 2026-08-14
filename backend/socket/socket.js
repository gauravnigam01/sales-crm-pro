import { Server } from "socket.io";

let io;

const onlineUsers = new Map();

export const initSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {

    console.log("🟢 User Connected:", socket.id);

    socket.on("identify", (userId) => {

      if (!userId) return;

      socket.userId = userId;

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }

      onlineUsers.get(userId).add(socket.id);

    });

    socket.on("disconnect", () => {

      console.log("🔴 User Disconnected:", socket.id);

      if (socket.userId && onlineUsers.has(socket.userId)) {

        onlineUsers.get(socket.userId).delete(socket.id);

        if (onlineUsers.get(socket.userId).size === 0) {
          onlineUsers.delete(socket.userId);
        }

      }

    });

  });

};

export const attachSocket = (server) => {
  if (io) {
    io.attach(server);
  }
};

export const getIO = () => {

  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;

};

export const getOnlineUserIds = () => Array.from(onlineUsers.keys());
