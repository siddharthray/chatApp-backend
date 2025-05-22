import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./api.js";
import { config } from "../config/environment.js";

type Express = express.Express;

export const setupRoutes = (app: Express) => {
  // API routes
  app.use(config.API_PREFIX, apiRouter);
};
