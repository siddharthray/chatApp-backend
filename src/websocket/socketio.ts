// src/websocket/socketio.ts
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { corsOptions } from "../config/cors.js";

export const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    try {
      socket.emit("message", "Welcome from Socket.IO!");
    } catch (error) {
      console.error("[Socket.IO] Emit error:", error);
    }

    // 🔍 This should log when messages are received
    socket.on("message", (data: any) => {
      try {
        console.log(`[Socket.IO] Message from ${socket.id}:`, data);
        io.emit("message", `${socket.id}: ${data}`);
      } catch (error) {
        console.error("[Socket.IO] Message error:", error);
        socket.emit("error", "Failed to process message");
      }
    });

    socket.on("error", (error: Error) => {
      console.error(`[Socket.IO] Connection error for ${socket.id}:`, error);
    });

    socket.on("disconnect", (reason: string) => {
      console.log(
        `[Socket.IO] Client disconnected: ${socket.id}, Reason: ${reason}`
      );
    });
  });

  // Handle Socket.IO errors
  io.engine.on("connection_error", (err: any) => {
    console.error("[Socket.IO] Connection error:", err.req);
    console.error(
      "[Socket.IO] Error details:",
      err.code,
      err.message,
      err.context
    );
  });

  return io;
};
