import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export const setupGracefulShutdown = (
  server: HTTPServer,
  io: SocketIOServer
) => {
  const gracefulShutdown = (signal: string): void => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    // Close Socket.IO connections
    io.close(() => {
      console.log("Socket.IO connections closed.");

      // Close HTTP server
      server.close((err?: Error) => {
        if (err) {
          console.error("Error during server shutdown:", err);
          process.exit(1);
        }

        console.log("HTTP server closed.");
        console.log("Graceful shutdown completed.");
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
