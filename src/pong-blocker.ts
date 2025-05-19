import WebSocket from "ws";

// Create WebSocket connection
const ws = new WebSocket("ws://localhost:8080");

// Connection opened
ws.on("open", () => {
  console.log("[PONG BLOCKER] Connected to server");

  // Send a message to verify connection
  ws.send(
    JSON.stringify({
      type: "chat",
      payload: "Testing pong validation by blocking pong responses",
    })
  );

  console.log("\n[PONG BLOCKER] Test procedure:");
  console.log("1. Connection established");
  console.log(
    "2. The first server ping will occur around 30 seconds after connection"
  );
  console.log(
    "3. This client will automatically BLOCK pong responses after 10 seconds"
  );
  console.log("4. Server should show 3 missed pongs warning after ~90 seconds");
  console.log(
    "5. Server should terminate connection after ~150 seconds (5 missed pongs)"
  );

  // After 10 seconds, replace the _socket.send method to block pongs
  // This is an advanced technique that intercepts low-level WebSocket frames
  setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log("\n[PONG BLOCKER] ⚠️ NOW BLOCKING ALL PONG RESPONSES");
      console.log(
        "[PONG BLOCKER] Server should detect missed pongs in about 30-90 seconds"
      );

      // Get the raw socket
      const socket = (ws as any)._socket;

      if (socket) {
        // Store the original send function
        const originalSend = socket.write.bind(socket);

        // Override the send function to filter out pong frames
        socket.write = (buffer: Buffer, ...args: any[]) => {
          // WebSocket pong frames start with byte 138 (0x8A)
          // This is a simplified check - actual implementation might need adjustment
          if (buffer.length > 0 && buffer[0] === 0x8a) {
            console.log("[PONG BLOCKER] 🛑 Blocking a pong frame");
            return true; // Pretend we sent it
          }

          // For all other frames, use the original send function
          return originalSend(buffer, ...args);
        };
      } else {
        console.error(
          "[PONG BLOCKER] Could not access socket to override pong"
        );
      }
    }
  }, 10000);
});

// Listen for messages
ws.on("message", (data: WebSocket.RawData) => {
  try {
    const { type, payload } = JSON.parse(data.toString());
    console.log(`[PONG BLOCKER] Received message: [${type}] ${payload}`);
  } catch (err) {
    console.error("[PONG BLOCKER] Error parsing message:", data.toString());
  }
});

// Connection closed
ws.on("close", (code: number, reason: Buffer) => {
  console.log(
    `[PONG BLOCKER] Connection closed with code ${code}: ${
      reason.toString() || "No reason"
    }`
  );
  console.log(
    "[PONG BLOCKER] If this happened after ~150 seconds with code 1006, validation SUCCEEDED"
  );
});

// Connection error
ws.on("error", (error) => {
  console.log("[PONG BLOCKER] WebSocket error:", error);
});

// Keep the client running until forcibly closed
process.stdin.resume();

console.log("[PONG BLOCKER] Pong blocker client running...");
console.log(
  "[PONG BLOCKER] This client maintains the connection but blocks pong responses"
);
console.log("[PONG BLOCKER] Watch the server logs for missed pong detection");
