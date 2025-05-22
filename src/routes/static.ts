import express from "express";
import path from "path";
import { fileURLToPath } from "url";

type Request = express.Request;
type Response = express.Response;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Route for Socket.IO client
router.get("/socketio", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/socketio-client.html"));
});

// Route for WebSocket client
router.get("/ws", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../public/ws-client.html"));
});

export { router as staticRouter };
