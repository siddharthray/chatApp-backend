import morgan from "morgan";
import { config } from "./environment.js";

export const morganMiddleware = () => {
  if (config.NODE_ENV === "development") {
    return morgan("dev");
  } else {
    return morgan("combined");
  }
};
