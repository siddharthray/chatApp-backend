import express from "express";
import { config } from "../config/environment.js";
import { CustomError } from "../types/index.js";
import redis from "../config/redisClient.js";
import {
  getDefaultRooms,
  searchRooms,
  createRoom,
} from "../controllers/room.controller.js";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

const router = express.Router();

router.get("/rooms/default", getDefaultRooms);
router.get("/rooms/search", searchRooms);
router.post("/rooms", createRoom);

// Health check endpoint
router.get("/health", async (_: Request, res: Response) => {
  let redisStatus = "unknown";

  try {
    const ping = await redis.ping();
    redisStatus = ping === "PONG" ? "connected" : "unreachable";
  } catch {
    redisStatus = "unreachable";
  }

  res.json({
    status: "ok",
    message: "Server is running",
    redis: redisStatus,
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Test error endpoint
router.get("/test-error", (_: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("This is a test error");
  error.status = 500;
  next(error);
});

export { router as apiRouter };
