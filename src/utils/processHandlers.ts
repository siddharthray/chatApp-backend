import { config } from "../config/environment.js";

export const setupProcessHandlers = () => {
  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  });
};
