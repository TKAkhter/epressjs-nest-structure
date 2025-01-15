import "winston-daily-rotate-file";
import { createLogger, format, transports, Logger } from "winston";
import { StatusCodes } from "http-status-codes";
import { env } from "@/config/env";
import fs from "fs";
import colors from "colors/safe";

const isWinstonEnabled = env.ENABLE_WINSTON === "1";

if (!fs.existsSync(env.LOGS_DIRECTORY) && isWinstonEnabled) {
  fs.mkdirSync(env.LOGS_DIRECTORY);
}

const createDailyRotateTransport = (level: string) =>
  new transports.DailyRotateFile({
    filename: `${level}-%DATE%.log`,
    dirname: env.LOGS_DIRECTORY,
    datePattern: "YYYY-MM-DD",
    level,
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: env.LOG_FILE_DURATION || "30d",
  });

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    http: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "blue",
    debug: "magenta",
  },
};

// NestJS-like console log format
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format.printf(({ level, message, timestamp, ...meta }: any) => {
    const metadata = meta && Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
    return `[${colors.cyan(timestamp)} ${env.TZ}] ${level}: ${message} ${metadata}`;
  }),
);

const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format.printf(({ level, message, timestamp, ...meta }: any) => {
    const metadata = meta && Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `[${timestamp} ${env.TZ}] ${level}: ${message} ${metadata}`;
  }),
);

const winstonLogger: Logger = createLogger({
  levels: logLevels.levels,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.align(),
  ),
  transports: isWinstonEnabled
    ? [
        new transports.Console({
          level: "debug",
          format: consoleFormat, // Use console-specific format
        }),
        new transports.DailyRotateFile({
          ...createDailyRotateTransport("info"),
          format: fileFormat, // Use file-specific format
        }),
        new transports.DailyRotateFile({
          ...createDailyRotateTransport("error"),
          format: fileFormat, // Use file-specific format
        }),
      ]
    : [],
});

// Export logger functions with fallback to console logs if disabled
export const logger = isWinstonEnabled
  ? {
      info: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.info(message, metadata),
      warn: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.warn(message, metadata),
      http: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.http(message, metadata),
      error: (message: string, metadata?: Record<string, unknown>) =>
        winstonLogger.error(message, metadata),
    }
  : {
      info: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.green(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}`)),
      warn: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.yellow(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}`)),
      http: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.blue(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}`)),
      error: (message: string, metadata?: Record<string, unknown>) =>
        console.log(colors.red(`${message}${metadata ? `, ${JSON.stringify(metadata)}` : ""}`)),
    };

export const morganStream = {
  write: (message: string) => {
    const statusCode = parseInt(message.split(" ")[2], 10);
    if (statusCode >= StatusCodes.BAD_REQUEST) {
      logger.error(message.trim());
    } else {
      logger.http(message.trim());
    }
  },
};
