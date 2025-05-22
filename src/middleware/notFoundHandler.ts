import express from "express";
import { CustomError } from "../types/index.js";

export const notFoundHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Silently handle browser auto-requests
  const ignoredPaths = [
    "/favicon.ico",
    "/.well-known/appspecific/com.chrome.devtools.json",
    "/apple-touch-icon.png",
    "/robots.txt",
    "/manifest.json",
    "/sw.js",
    "/.well-known/security.txt",
  ];

  if (ignoredPaths.includes(req.path)) {
    res.status(404).end(); // Silent 404, no error thrown
    return;
  }

  // Log and handle actual 404s
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  const error: CustomError = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  error.status = 404;
  next(error);
};
