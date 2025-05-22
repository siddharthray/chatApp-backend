import express from "express";
import { CustomError } from "../types/index.js";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: CustomError = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  error.status = 404;
  next(error);
};
