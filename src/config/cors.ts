import cors from "cors";
import { config } from "./environment.js";

export const corsOptions = {
  origin: config.CORS_ORIGIN,
  methods: ["GET", "POST"],
};

export const corsMiddleware = cors(corsOptions);
