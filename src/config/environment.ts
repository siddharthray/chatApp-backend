import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8080,
  API_PREFIX: process.env.API_PREFIX || "/api",
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  STATIC_DIR: process.env.STATIC_DIR || "../public",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
} as const;
