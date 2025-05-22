import redis from "../config/redisClient.js";

/**
 * Save a message to a room's chat log in Redis.
 * Keeps only the last 50 messages.
 */
export const saveMessage = async (room: string, message: string) => {
  await redis.rpush(`chat:${room}`, message);
  await redis.ltrim(`chat:${room}`, -50, -1);
};

/**
 * Get the latest messages from Redis for a room.
 */
export const getRecentMessages = async (room: string) => {
  const messages = await redis.lrange(`chat:${room}`, -50, -1);
  return messages.map((m) => JSON.parse(m));
};

/**
 * Add a user to a room's presence list.
 */
export const addUserToRoom = async (room: string, username: string) => {
  await redis.sadd(`room:${room}:users`, username);
};

/**
 * Remove a user from a room's presence list.
 */
export const removeUserFromRoom = async (room: string, username: string) => {
  await redis.srem(`room:${room}:users`, username);
};

/**
 * Get all users currently in a room.
 */
export const getUsersInRoom = async (room: string) => {
  return await redis.smembers(`room:${room}:users`);
};
