import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  // ✅ Valid structured message
  ws.send(JSON.stringify({ type: "chat", payload: "Hello Server!" }));

  // ❌ Raw string - invalid
  ws.send("just a plain string");

  // ❌ Missing type
  ws.send(JSON.stringify({ payload: "Missing type" }));

  // ❌ Malformed JSON
  ws.send("{ type: chat }");

  // ❌ Invalid type
  ws.send(JSON.stringify({ type: "unknown", payload: "Hello Server!" }));
});

ws.on("message", (data: WebSocket.RawData) => {
  const { type, payload } = JSON.parse(data.toString());
  console.log(`[${type}] ${payload}`);
});
