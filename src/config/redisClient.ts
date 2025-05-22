// src/config/redisClient.ts
import { Redis } from "ioredis";
import { config } from "./environment.js";

const redis = new Redis(config.REDIS_URL, {
  retryStrategy: (times) => {
    console.log(`[Redis] Retry attempt #${times}`);
    console.log(`[Redis] This is attempt number: ${times}`);

    if (times > 10) {
      console.log("[Redis] Too many retries, giving up");
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000); // exponential backoff
    console.warn(`[Redis] Retry attempt #${times}, delaying ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    console.error("[Redis] Reconnect on error:", err.message);
    return true;
  },
});

redis.on("connect", () => {
  console.log("[Redis] Connected to", config.REDIS_URL);
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err);
});

export default redis;
