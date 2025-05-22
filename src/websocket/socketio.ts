import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { corsOptions } from "../config/cors.js";

export const setupSocketIO = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("Socket.IO connected:", socket.id);

    try {
      socket.emit("message", "Welcome from Socket.IO!");
    } catch (error) {
      console.error("Socket.IO emit error:", error);
    }

    socket.on("message", (data: any) => {
      try {
        io.emit("message", `${socket.id}: ${data}`);
      } catch (error) {
        console.error("Socket.IO message error:", error);
        socket.emit("error", "Failed to process message");
      }
    });

    socket.on("error", (error: Error) => {
      console.error("Socket.IO connection error:", error);
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Socket.IO disconnected:", socket.id, "Reason:", reason);
    });
  });

  // Handle Socket.IO errors
  io.engine.on("connection_error", (err: any) => {
    console.error("Socket.IO connection error:", err.req);
    console.error("Error details:", err.code, err.message, err.context);
  });

  return io;
};
