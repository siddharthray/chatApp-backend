import express from "express";
import { CustomError } from "../types/index.js";
import { config } from "../config/environment.js";

export const globalErrorHandler = (
  err: CustomError,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void => {
  const status = err.status || err.statusCode || 500;

  const errorResponse: any = {
    error: {
      message: err.message || "Internal Server Error",
      status: status,
      timestamp: new Date().toISOString(),
    },
  };

  console.error(
    `[ERROR ${status}] ${req.method} ${req.originalUrl}:`,
    err.message
  );

  if (config.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
    errorResponse.error.url = req.originalUrl;
    errorResponse.error.method = req.method;
    console.error("Stack trace:", err.stack);
  }

  res.status(status).json(errorResponse);
  return;
};
