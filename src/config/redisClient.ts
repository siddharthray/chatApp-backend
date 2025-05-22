// src/config/redisClient.ts
import { Redis } from "ioredis";
import { config } from "./environment.js";

const redis = new Redis(config.REDIS_URL); // Singleton connection

redis.on("connect", () => {
  console.log("[Redis] Connected to", config.REDIS_URL);
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

export default redis;
