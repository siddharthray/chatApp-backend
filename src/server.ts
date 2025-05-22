import express from "express";
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// Load environment variables from .env file
dotenv.config();

// Proper __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 8080;
const API_PREFIX = process.env.API_PREFIX || "/api";
const NODE_ENV = process.env.NODE_ENV || "development";

// Custom error interface
interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

// Extended WebSocket interface with id
interface ExtendedWebSocket extends WebSocket {
  id?: string;
}

const app = express();
// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
};
const corsMiddleware = cors(corsOptions);

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Morgan logging middleware
if (NODE_ENV === "development") {
  // Detailed logging for development
  app.use(morgan("dev"));
} else {
  // Combined log format for production
  app.use(morgan("combined"));
}

// Route for Socket.IO client
app.get("/socketio", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/socketio-client.html"));
});

// Route for WebSocket client
app.get("/ws", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/ws-client.html"));
});

// Health check endpoint
app.get(`${API_PREFIX}/health`, (_: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Test error endpoint (for testing error handling)
app.get(
  `${API_PREFIX}/test-error`,
  (_: Request, res: Response, next: NextFunction) => {
    const error: CustomError = new Error("This is a test error");
    error.status = 500;
    next(error);
  }
);

// 3. STATIC FILES (last middleware, acts as catch-all)
app.use(express.static(path.join(__dirname, "../public")));

// 404 Handler - Must come after all routes and static files
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  error.status = 404;
  next(error);
});

// Global Error Handler - Must be the LAST middleware
app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  // Set default error status if not set
  const status = err.status || err.statusCode || 500;

  // Create error response
  const errorResponse: any = {
    error: {
      message: err.message || "Internal Server Error",
      status: status,
      timestamp: new Date().toISOString(),
    },
  };

  // Log error to console
  console.error(
    `[ERROR ${status}] ${req.method} ${req.originalUrl}:`,
    err.message
  );

  // Add additional details in development mode
  if (NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
    errorResponse.error.url = req.originalUrl;
    errorResponse.error.method = req.method;
    console.error("Stack trace:", err.stack);
  }

  // Send error response
  res.status(status).json(errorResponse);
});

const server = http.createServer(app);

// 1. SOCKET.IO SERVER
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

// 2. NATIVE WS SERVER
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  const wsId = uuidv4();
  (ws as ExtendedWebSocket).id = wsId;

  console.log("Native WebSocket connected", wsId);

  try {
    ws.send("Welcome from native WebSocket!");
  } catch (error) {
    console.error(`WebSocket send error for ${wsId}:`, error);
  }

  ws.on("message", (msg: Buffer) => {
    try {
      console.log(`WS Message from ${wsId}:`, msg.toString());

      wss.clients.forEach((client: WebSocket) => {
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`WS Broadcast: ${msg}`);
          }
        } catch (broadcastError) {
          console.error("WebSocket broadcast error:", broadcastError);
        }
      });
    } catch (error) {
      console.error(`WebSocket message handling error for ${wsId}:`, error);
      try {
        ws.send(JSON.stringify({ error: "Failed to process message" }));
      } catch (sendError) {
        console.error("Failed to send error message:", sendError);
      }
    }
  });

  ws.on("error", (error: Error) => {
    console.error(`WebSocket error for ${wsId}:`, error);
  });

  ws.on("close", (code: number, reason: Buffer) => {
    console.log(
      `WebSocket ${wsId} closed with code: ${code}, reason: ${reason.toString()}`
    );
  });
});

// Handle WebSocket errors
wss.on("error", (error: Error) => {
  console.error("WebSocket Server error:", error);
});

// HTTP -> WS upgrade with error handling
server.on("upgrade", (req: http.IncomingMessage, socket: any, head: Buffer) => {
  try {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  } catch (error) {
    console.error("WebSocket upgrade error:", error);
    socket.destroy();
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  // In production, you might want to gracefully shutdown
  if (NODE_ENV === "production") {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to gracefully shutdown
  if (NODE_ENV === "production") {
    process.exit(1);
  }
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string): void => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  server.close((err?: Error) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("HTTP server closed.");

    // Close WebSocket connections
    wss.clients.forEach((client: WebSocket) => {
      client.terminate();
    });

    console.log("WebSocket connections closed.");
    console.log("Graceful shutdown completed.");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(
    `API endpoints available at: http://localhost:${PORT}${API_PREFIX}`
  );
});
