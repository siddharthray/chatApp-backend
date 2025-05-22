import { Request, Response } from "express";
import * as RoomService from "../services/room.service.js";

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
  const { q } = req.query;
  if (typeof q !== "string" || q.length < 3) {
    res.status(400).json({ error: "Query must be at least 3 characters" });
    return;
  }

  const results = await RoomService.searchRooms(q);
  res.json({ results });
};

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "Room name is required" });
    return;
  }

  await RoomService.createRoom(name);
  res.status(201).json({ status: "Room created" });
};
