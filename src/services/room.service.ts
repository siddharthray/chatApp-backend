// src/services/room.service.ts
import Redis from "../config/redisClient.js";

export const getDefaultRooms = async (): Promise<string[]> => {
  return ["general", "tech", "random", "support"];
};

export const searchRooms = async (query: string): Promise<string[]> => {
  const allRooms = await Redis.smembers("rooms:all");
  return allRooms
    .filter(
      (r) =>
        query.length >= 3 &&
        query
          .toLowerCase()
          .split("")
          .every((char) => r.toLowerCase().includes(char))
    )
    .slice(0, 10); // Top 10 fuzzy matches
};

export const createRoom = async (name: string): Promise<void> => {
  await Redis.sadd("rooms:all", name);
};
