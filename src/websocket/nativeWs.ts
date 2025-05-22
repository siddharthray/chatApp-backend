// src/websocket/nativeWs.ts
import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { ExtendedWebSocket } from "../types/index.js";

export const setupNativeWebSocket = (server: HTTPServer) => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    const wsId = uuidv4();
    (ws as ExtendedWebSocket).id = wsId;

    console.log(`[WS] Native WebSocket connected: ${wsId}`);

    try {
      ws.send("Welcome from native WebSocket!");
    } catch (error) {
      console.error(`[WS] Send error for ${wsId}:`, error);
    }

    ws.on("message", (msg: Buffer) => {
      try {
        const message = msg.toString();
        console.log(`[WS] Message from ${wsId}: ${message}`);

        wss.clients.forEach((client: WebSocket) => {
          try {
            if (client.readyState === WebSocket.OPEN) {
              client.send(`WS Broadcast: ${message}`);
            }
          } catch (broadcastError) {
            console.error("[WS] Broadcast error:", broadcastError);
          }
        });
      } catch (error) {
        console.error(`[WS] Message handling error for ${wsId}:`, error);
        try {
          ws.send(JSON.stringify({ error: "Failed to process message" }));
        } catch (sendError) {
          console.error("[WS] Failed to send error message:", sendError);
        }
      }
    });

    ws.on("error", (error: Error) => {
      console.error(`[WS] Error for ${wsId}:`, error);
    });

    ws.on("close", (code: number, reason: Buffer) => {
      console.log(
        `[WS] ${wsId} disconnected - Code: ${code}, Reason: ${reason.toString()}`
      );
    });
  });

  // ✅ FIXED: Proper upgrade handler that doesn't interfere with Socket.IO
  server.on("upgrade", (req, socket, head) => {
    try {
      console.log(`🔧 DEBUG: Upgrade request for: ${req.url}`);

      // Only handle native WebSocket upgrades, let Socket.IO handle its own
      if (req.url === "/ws") {
        console.log("[WS] Handling native WebSocket upgrade");
        wss.handleUpgrade(req, socket, head, (ws: WebSocket) => {
          console.log("[WS] Native WebSocket upgrade successful");
          wss.emit("connection", ws, req);
        });
      } else if (req.url?.startsWith("/socket.io/")) {
        // Let Socket.IO handle its own upgrades - don't interfere!
        console.log("[WS] Ignoring Socket.IO upgrade (handled by Socket.IO)");
        return; // Don't destroy the socket, let Socket.IO handle it
      } else {
        console.log(`[WS] Rejecting upgrade for unknown path: ${req.url}`);
        socket.destroy();
      }
    } catch (error) {
      console.error("[WS] Upgrade error:", error);
      socket.destroy();
    }
  });

  wss.on("error", (error: Error) => {
    console.error("[WS] Server error:", error);
  });

  return wss;
};
