import app from "./app";
import redis from "./common/redis/redis";
import { logger } from "./common/winston/winston";
import { env } from "./config/env";
import knex from "./database/knex";
import mongoose from "mongoose";

const PORT = env.PORT || 3000;
const ENV = env.NODE_ENV;
const API = env.BASE_URL;
const ALLOW_ORIGIN = env.ALLOW_ORIGIN;

async function checkConnections() {
  try {
    await knex.raw("SELECT 1+1 AS result");
    logger.info("Postgres connections verified successfully.");
    await redis.ping();
    logger.info("Redis connections verified successfully.");
    await mongoose.connect(env.MONGODB_URI || "");
    logger.info("MongoDB connections verified successfully.");
  } catch (error) {
    logger.error("Postgres, MongoDb or Redis connection failed", error);
    process.exit(1);
  }
}

checkConnections().then(() => {
  const server = app.listen(PORT, () => logger.info(`Server running on PORT: ${PORT}, ==> ENV: ${ENV}, ==> API: ${API}, ==> ALLOW_ORIGIN: ${ALLOW_ORIGIN}`));

  const onCloseSignal = () => {
    logger.info("SIGTERM signal received. Closing server...");
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit();
    });
    setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
  };

  process.on("SIGINT", onCloseSignal);
  process.on("SIGTERM", onCloseSignal);
});
