import WebSocket from "ws";

// Create WebSocket connection
const ws = new WebSocket("ws://localhost:8080");

// Track connection status
let isConnected = false;
let messageCount = 0;

// Connection opened
ws.on("open", () => {
  console.log("[CLIENT] Connected to server");
  isConnected = true;

  // Send a test message
  sendMessage("Hello from zombie client!");

  // Send another message after 10 seconds
  setTimeout(() => {
    if (isConnected) {
      sendMessage("This is a message from the zombie client");
    }
  }, 10000);

  // After 15 seconds, simulate a network issue by destroying the socket
  // without a proper WebSocket close handshake
  setTimeout(() => {
    console.log(
      "\n[ZOMBIE CLIENT] ☠️ Simulating network failure without proper close..."
    );
    console.log(
      "[ZOMBIE CLIENT] ☠️ Server should detect this as missed pongs after 3 heartbeats"
    );

    // Force terminate the socket connection without proper close
    // This is a hacky way to simulate a network issue
    try {
      // @ts-ignore - accessing private property to force connection termination
      (ws as any)._socket.destroy();
    } catch (err) {
      console.log(
        "[ZOMBIE CLIENT] Could not destroy socket directly, using alternative"
      );
      // Alternative: process.exit() will abruptly end the process without cleanup
      process.exit(1);
    }
  }, 15000);
});

// Helper function to send messages
function sendMessage(text: string): void {
  messageCount++;
  console.log(
    `\n[ZOMBIE CLIENT SENDING #${messageCount}] Sending message: "${text}"`
  );
  ws.send(JSON.stringify({ type: "chat", payload: text }));
}

// Listen for messages
ws.on("message", (data: WebSocket.RawData) => {
  try {
    const { type, payload } = JSON.parse(data.toString());
    console.log(`[ZOMBIE CLIENT RECEIVED] Server says: [${type}] ${payload}`);
  } catch (err) {
    console.error("[ZOMBIE CLIENT] Error parsing message:", data.toString());
  }
});

// Connection closed - this shouldn't be called in our test since we're forcibly terminating
ws.on("close", () => {
  console.log(
    `[ZOMBIE CLIENT] Connection closed through proper channel - this shouldn't happen in our test`
  );
  isConnected = false;
});

// Connection error
ws.on("error", (error) => {
  console.error("[ZOMBIE CLIENT] WebSocket error:", error);
});

console.log("[ZOMBIE CLIENT] ☠️ Zombie client test starting...");
console.log(
  "[ZOMBIE CLIENT] ☠️ This client will IMPROPERLY disconnect after 15 seconds"
);
console.log(
  "[ZOMBIE CLIENT] ☠️ The server should detect missed heartbeats after about 1.5-2 minutes"
);
console.log(
  "[ZOMBIE CLIENT] ☠️ Watch for [SERVER HEARTBEAT WARNING] logs in your server terminal"
);
