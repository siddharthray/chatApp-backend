import express from "express";
import { config } from "../config/environment.js";
import { CustomError } from "../types/index.js";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

const router = express.Router();

// Health check endpoint
router.get("/health", (_: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running",
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
