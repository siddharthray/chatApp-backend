import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { ExtendedWebSocket } from "../types/index.js";

export const setupNativeWebSocket = (server: HTTPServer) => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
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
  server.on("upgrade", (req, socket, head) => {
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

  return wss;
};
