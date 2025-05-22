import { Server as HTTPServer } from "http";
import { WebSocketServer } from "ws";

export const setupGracefulShutdown = (
  server: HTTPServer,
  wss: WebSocketServer
) => {
  const gracefulShutdown = (signal: string): void => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    server.close((err?: Error) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }

      console.log("HTTP server closed.");

      wss.clients.forEach((client) => {
        client.terminate();
      });

      console.log("WebSocket connections closed.");
      console.log("Graceful shutdown completed.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
