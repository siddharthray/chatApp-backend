import { Server as HTTPServer } from "http";
import { setupSocketIO } from "./socketio.js";
import { setupNativeWebSocket } from "./nativeWs.js";

export const setupWebSockets = (server: HTTPServer) => {
  const io = setupSocketIO(server);
  const wss = setupNativeWebSocket(server);

  return { io, wss };
};
