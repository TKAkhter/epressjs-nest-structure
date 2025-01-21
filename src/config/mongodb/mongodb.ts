import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/common/winston/winston";
import ErrorLogs from "@/models/error-logs";

export const connectMongoDB = async () =>
  mongoose.connect(env.MONGODB_URI, {
    dbName: env.NODE_ENV,
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkMemoryAndLog = async (logData: any) => {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.NODE_ENV,
      });
    }

    const stats = await mongoose.connection.db!.stats();
    const dbUsage = stats.dataSize / (1024 * 1024);
    const dbLimit = Number(env.MONGODB_MEMORY_LIMIT);

    logger.info(`Database usage: ${dbUsage.toFixed(2)} MB of ${dbLimit} MB`);

    if (dbUsage < dbLimit / 2) {
      const log = new ErrorLogs(env.MONGODB_ERROR_COLLECTION_NAME, logData);
      await log.save();
    } else {
      logger.warn(`Database usage: ${dbUsage.toFixed(2)} MB of ${dbLimit} MB`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.warn("MongoDB Error:", error);
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  }
};
