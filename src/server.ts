import WebSocket, { WebSocketServer } from "ws";

// Define expected message format
interface ClientMessage {
  type: string;
  payload?: any;
}

// Create WebSocket server on port 8080
const server = new WebSocketServer({ port: 8080 });

server.on("connection", (socket: WebSocket) => {
  // Send welcome message on new connection
  const welcome = {
    type: "welcome",
    payload: "Welcome to the chat!",
  };
  socket.send(JSON.stringify(welcome));

  // Handle incoming messages
  socket.on("message", (message: string) => {
    try {
      const parsed: unknown = JSON.parse(message);

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
});

// Type guard to validate incoming message
function isValidClientMessage(obj: any): obj is ClientMessage {
  return obj && typeof obj === "object" && typeof obj.type === "string";
}
