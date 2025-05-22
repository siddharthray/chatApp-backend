// src/websocket/socketio.ts
import type { Server, Socket } from "socket.io";
import {
  saveMessage,
  getRecentMessages,
  addUserToRoom,
  removeUserFromRoom,
  getUsersInRoom,
} from "../services/chat.service.js";

export const setupSocketIO = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    let room = "";
    let username = "";

    socket.on("join-room", async ({ roomName, user }) => {
      room = roomName;
      username = user;
      socket.join(room);

      await addUserToRoom(room, username);

      const history = await getRecentMessages(room);
      socket.emit("history", history);

      const users = await getUsersInRoom(room);
      io.to(room).emit("user-list", users);
    });

    socket.on("send-msg", async ({ roomName, from, msg }) => {
      const payload = { from, text: msg, time: Date.now() };
      await saveMessage(roomName, JSON.stringify(payload));
      io.to(roomName).emit("receive-msg", payload);
    });

    socket.on("disconnect", async () => {
      if (room && username) {
        await removeUserFromRoom(room, username);
        const users = await getUsersInRoom(room);
        io.to(room).emit("user-list", users);
      }
    });
  });
};
