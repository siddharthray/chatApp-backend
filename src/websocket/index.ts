// src/websocket/index.ts
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { setupSocketIO } from "./socketio.js";

export const setupWebSockets = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  setupSocketIO(io);
  return { io };
};
