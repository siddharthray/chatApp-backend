import { z } from "zod";

export const CreateRoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters"),
  limit: z.number().min(10).max(500).optional(),
});

export const SearchRoomSchema = z.object({
  q: z.string().min(3, "Search query must be at least 3 characters"),
});
