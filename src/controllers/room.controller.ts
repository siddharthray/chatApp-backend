import { Request, Response } from "express";
import * as RoomService from "../services/room.service.js";
import {
  CreateRoomSchema,
  SearchRoomSchema,
} from "../validators/room.schema.js";

export const getDefaultRooms = async (
  _: Request,
  res: Response
): Promise<void> => {
  const rooms = await RoomService.getDefaultRooms();
  res.json({ rooms });
};

export const searchRooms = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = SearchRoomSchema.safeParse(req.query);

  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }

  const { q } = parseResult.data;
  const results = await RoomService.searchRooms(q);
  res.json({ results });
};

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = CreateRoomSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.errors[0].message });
    return;
  }

  const { name } = parseResult.data;
  await RoomService.createRoom(name);
  res.status(201).json({ status: "Room created" });
};
