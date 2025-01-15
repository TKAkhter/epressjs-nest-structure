import { NextFunction, Response } from "express";
import { HttpError } from "http-errors";
import { StatusCodes } from "http-status-codes";
import { env } from "@/config/env";
import { logger } from "@/common/winston/winston";
import { CustomRequest } from "@/types/request";

/**
 * Error middleware for catching and logging errors.
 *
 * Params:
 * - err: The error object (could be a HttpError or general error).
 * - req: The request object (with optional user data).
 * - res: The response object.
 * - _: The NextFunction (unused in this case).
 *
 * Response:
 * - Responds with the appropriate status code and error message in the response.
 * - If not in production, detailed error info is included (method, URL, stack trace).
 */
export const errorMiddleware = (
  err: Error | HttpError,
  req: CustomRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: NextFunction,
): Response => {
  const { message, ...details } = err;
  const isHttpError = err instanceof HttpError;

  const statusCode = isHttpError
    ? err.status || StatusCodes.INTERNAL_SERVER_ERROR
    : StatusCodes.INTERNAL_SERVER_ERROR;

  const name = isHttpError ? err.name : "AppError";

  const user = req.user || "Unknown User";
  const { method } = req;
  const url = req.originalUrl;

  // Const { stack } = err;

  const errorPayload = {
    status: statusCode,
    message,
    method,
    url,
    user,
    name,
    details,
    // Stack,
  };

  logger.error("Error Middleware", errorPayload);

  const responsePayload = {
    status: statusCode,
    message,
    ...(env.NODE_ENV !== "production" && { method, url, user, name, details /* Stack */ }),
  };

  return res.status(statusCode).json(responsePayload);
};
