import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./api.js";
import { staticRouter } from "./static.js";
import { config } from "../config/environment.js";

type Express = express.Express;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupRoutes = (app: Express) => {
  // Static routes
  app.use(staticRouter);

  // API routes
  app.use(config.API_PREFIX, apiRouter);

  // Static files (last)
  app.use(express.static(path.join(__dirname, config.STATIC_DIR)));
};
