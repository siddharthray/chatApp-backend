import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;
const API_PREFIX = process.env.API_PREFIX || "/api";
const NODE_ENV = process.env.NODE_ENV || "development";
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, "../public");
const WS_HEARTBEAT_INTERVAL = parseInt(
  process.env.WS_HEARTBEAT_INTERVAL || "30000",
  10
); // 30 seconds

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
};
const corsMiddleware = cors(corsOptions);

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Serve static files directly from the root
app.use(express.static(STATIC_DIR));

// Add basic logging middleware
app.use((req, _, next) => {
  if (process.env.LOG_LEVEL === "debug" || process.env.LOG_LEVEL === "info") {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  }
  next();
});

// Health check endpoint
app.get(`${API_PREFIX}/health`, (_, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server });

// WebSocket connection handler
wss.on("connection", (socket: WebSocket) => {
  // Add a unique ID to each connection for better logging
  const connectionTime = new Date().toISOString();
  (socket as any)._socketId = connectionTime.substring(11, 19); // Use time as ID
  const clientId = (socket as any)._socketId;

  console.log(`[WS] New WebSocket connection established: Client ${clientId}`);

  // Send welcome message on new connection
  const welcome = {
    type: "welcome",
    payload: "Welcome to the chat!",
  };
  socket.send(JSON.stringify(welcome));

  // Set up pong listener to track client responses
  socket.on("pong", () => {
    console.log(
      `[SERVER HEARTBEAT] ✅ Automatic pong received from client ${clientId}`
    );
    // Reset missed pongs counter in the listener
    missedPongs = 0;
  });

  // Set up ping interval to keep connection alive
  let missedPongs = 0;
  const pingInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      // Log ping with client identifier (we'll use connection timestamp)
      const clientId = (socket as any)._socketId;
      console.log(
        `\n[SERVER HEARTBEAT] ❤️ Automatic 30-second ping sent to client ${clientId}`
      );

      // Send ping
      socket.ping();

      // Check for missed pongs
      missedPongs++;
      if (missedPongs >= 3) {
        console.warn(
          `[SERVER HEARTBEAT WARNING] ⚠️ Client ${clientId} missed ${missedPongs} pongs, connection may be dead`
        );
        // After too many missed pongs, terminate the connection
        if (missedPongs >= 5) {
          console.error(
            `[SERVER HEARTBEAT ERROR] ❌ Client ${clientId} unresponsive after ${missedPongs} missed pongs, terminating connection`
          );
          socket.terminate();
          clearInterval(pingInterval);
        }
      }
    }
  }, WS_HEARTBEAT_INTERVAL);

  // Handle incoming messages
  socket.on("message", (message: string) => {
    console.log(`[MESSAGE FROM CLIENT ${clientId}] Received client message`);
    try {
      const parsed: unknown = JSON.parse(message.toString());

      if (!isValidClientMessage(parsed)) {
        throw new Error('Invalid message structure. "type" is required.');
      }

      const { type, payload } = parsed;

      switch (type) {
        case "chat":
          socket.send(
            JSON.stringify({
              type: "chatResponse",
              payload: `You said: ${payload}`,
            })
          );
          break;

        default:
          socket.send(
            JSON.stringify({
              type: "error",
              payload: `Unknown message type: ${type}`,
            })
          );
      }
    } catch (err: any) {
      socket.send(
        JSON.stringify({
          type: "error",
          payload: err.message || "Unknown error",
        })
      );
    }
  });

  // Handle connection close
  socket.on("close", (code: number, reason: string) => {
    const clientId = (socket as any)._socketId;
    console.log(
      `\n[CLIENT DISCONNECTED] Client ${clientId} disconnected with code: ${code}, reason: ${
        reason || "No reason provided"
      }`
    );
    console.log(
      `[CLIENT DISCONNECTED] Stopping heartbeat checks for client ${clientId}`
    );
    clearInterval(pingInterval);

    // Log active connections
    const activeConnections = wss.clients.size;
    console.log(
      `[SERVER STATUS] Active connections remaining: ${activeConnections}`
    );
  });
});

// Define expected message format
interface ClientMessage {
  type: string;
  payload?: any;
}

// Type guard to validate incoming message
function isValidClientMessage(obj: any): obj is ClientMessage {
  return obj && typeof obj === "object" && typeof obj.type === "string";
}

// Start the server
server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`REST API available at http://localhost:${PORT}${API_PREFIX}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}`);
  console.log(`Static files served from http://localhost:${PORT}/`);

  if (NODE_ENV === "development") {
    console.log("\nEnvironment variables:");
    console.log(`- PORT: ${PORT}`);
    console.log(`- API_PREFIX: ${API_PREFIX}`);
    console.log(`- STATIC_DIR: ${STATIC_DIR}`);
    console.log(`- CORS_ORIGIN: ${process.env.CORS_ORIGIN || "*"}`);
    console.log(`- NODE_ENV: ${NODE_ENV}`);
    console.log(`- WS_HEARTBEAT_INTERVAL: ${WS_HEARTBEAT_INTERVAL}ms`);
  }
});
