import { z } from "zod";

export const CreateRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
});

export const SearchRoomSchema = z.object({
  q: z.string().min(3, "Search query must be at least 3 characters"),
});
