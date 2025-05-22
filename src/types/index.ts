import { WebSocket } from "ws";

export interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}
