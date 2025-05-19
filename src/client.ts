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
  sendMessage("Hello Server!");

  // Send another message after 10 seconds
  setTimeout(() => {
    if (isConnected) {
      sendMessage("This is a CLIENT-INITIATED message after 10 seconds");
    }
  }, 10000);

  // Send a third message after 20 seconds
  setTimeout(() => {
    if (isConnected) {
      sendMessage("This is another CLIENT-INITIATED message after 20 seconds");
    }
  }, 20000);

  // Send a message after 40 seconds (after first server heartbeat)
  setTimeout(() => {
    if (isConnected) {
      sendMessage(
        "This message is sent AFTER the first server 30-second heartbeat"
      );
    }
  }, 40000);

  // Properly close the connection after 50 seconds
  setTimeout(() => {
    console.log(
      "\n[CLIENT] Properly closing the connection after 50 seconds..."
    );
    ws.close(1000, "Normal closure by client");
  }, 50000);
});

// Helper function to send messages
function sendMessage(text: string): void {
  messageCount++;
  console.log(`\n[CLIENT SENDING #${messageCount}] Sending message: "${text}"`);
  ws.send(JSON.stringify({ type: "chat", payload: text }));
}

// Listen for messages
ws.on("message", (data: WebSocket.RawData) => {
  try {
    const { type, payload } = JSON.parse(data.toString());
    console.log(`[CLIENT RECEIVED] Server says: [${type}] ${payload}`);
  } catch (err) {
    console.error("[CLIENT] Error parsing message:", data.toString());
  }
});

// Connection closed
ws.on("close", (code: number, reason: Buffer) => {
  console.log(
    `[CLIENT] Disconnected from server with code: ${code}, reason: ${
      reason.toString() || "No reason"
    }`
  );
  isConnected = false;
});

// Connection error
ws.on("error", (error) => {
  console.error("[CLIENT] WebSocket error:", error);
});

console.log("[CLIENT] WebSocket test client running...");
console.log(
  "[CLIENT] This client will send messages at 0, 10, 20, and 40 seconds"
);
console.log("[CLIENT] The server should send a heartbeat ping at 30 seconds");
console.log("[CLIENT] The client will properly close at 50 seconds");
console.log(
  "[CLIENT] Watch for [SERVER HEARTBEAT] logs in your server terminal"
);
