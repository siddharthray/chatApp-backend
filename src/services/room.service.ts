import Redis from "../config/redisClient.js";

const DEFAULT_ROOM_LIMIT = 500;

export const getDefaultRooms = async (): Promise<string[]> => {
  return ["general", "tech", "random", "support"];
};

export const ensureDefaultRoomsExist = async (): Promise<void> => {
  const defaults = await getDefaultRooms();
  const existing = await Redis.smembers("rooms:all");
  const missing = defaults.filter((room) => !existing.includes(room));

  if (missing.length > 0) {
    await Redis.sadd("rooms:all", ...missing);
    for (const room of missing) {
      await Redis.hset(
        `room:${room}:config`,
        "limit",
        DEFAULT_ROOM_LIMIT.toString()
      );
    }
    console.log("[RoomService] Default rooms added:", missing);
  } else {
    console.log("[RoomService] Default rooms already exist.");
  }
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

export const createRoom = async (
  name: string,
  limit: number = DEFAULT_ROOM_LIMIT
): Promise<void> => {
  await Redis.sadd("rooms:all", name);
  await Redis.hset(`room:${name}:config`, "limit", limit.toString());
};
