import app from "@/app";
import { env } from "@/config/env";
import { logger } from "@/common/winston/winston";
import { connectMongoDB } from "@/config/mongodb/mongodb";
import { checkMongoDB, checkRedis } from "@/entities/health/health.helper";

const { PORT, NODE_ENV, BASE_URL, ALLOW_ORIGIN } = env;

/**
 * Function to check the connection status for Redis, and MongoDB.
 * Logs the success or failure of each connection check.
 */
async function checkConnections() {
  try {
    logger.info("Checking database connections...");
    await checkRedis();
    logger.info("Redis connections verified successfully.");
    await connectMongoDB();
    await checkMongoDB();
    logger.info("MongoDB connections verified successfully.");
  } catch (error) {
    if (error instanceof Error) {
      logger.warn("MongoDB, or Redis connection failed", { error: error.message });
    } else {
      logger.warn("Unknown error occurred during connection checks");
    }

    // eslint-disable-next-line no-process-exit
    process.exit(1); // Exit the process if any connection check fails
  }
}

/**
 * Function to start the server and handle termination signals (SIGINT, SIGTERM).
 * Logs the server status on startup and graceful shutdown.
 */
checkConnections().then(() => {
  const server = app.listen(PORT, () =>
    logger.info(
      `Server running on PORT: ${PORT}, ==> ENV: ${NODE_ENV}, ==> API: ${BASE_URL}, ==> ALLOW_ORIGIN: ${ALLOW_ORIGIN}`,
    ),
  );

  const onCloseSignal = () => {
    logger.info("SIGTERM signal received. Closing server...");
    server.close(() => {
      logger.info("HTTP server closed.");
      // eslint-disable-next-line no-process-exit
      process.exit(); // Ensure the process exits after server closure
    });
  };

  process.on("SIGINT", onCloseSignal); // Gracefully handle SIGINT (Ctrl+C or control+C)
  process.on("SIGTERM", onCloseSignal); // Gracefully handle SIGTERM (from Docker, etc.)
});
