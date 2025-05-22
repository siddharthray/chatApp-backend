import express from "express";
import http from "http";
import { config } from "./config/environment.js";
import { corsMiddleware } from "./config/cors.js";
import { morganMiddleware } from "./config/morgan.js";
import { setupRoutes } from "./routes/index.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/index.js";
import { setupWebSockets } from "./websocket/index.js";
import { setupProcessHandlers } from "./utils/processHandlers.js";
import { setupGracefulShutdown } from "./utils/gracefulShutdown.js";
import { ensureDefaultRoomsExist } from "./services/room.service.js";

// Initialize Express app
const app = express();

// Setup process handlers
setupProcessHandlers();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(morganMiddleware());

// Routes
setupRoutes(app);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSockets
const { io } = setupWebSockets(server);

// Setup graceful shutdown
setupGracefulShutdown(server, io);

// Start server
const startServer = async () => {
  await ensureDefaultRoomsExist();

  server.listen(config.PORT, () => {
    console.log(`Server running at http://localhost:${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(
      `API endpoints: http://localhost:${config.PORT}${config.API_PREFIX}`
    );
  });
};

startServer();
