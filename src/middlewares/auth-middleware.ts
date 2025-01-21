import { NextFunction, Response } from "express";
import { CustomRequest } from "@/types/request";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "@/common/jwt/jwt";
import { winstonLogger } from "@/common/winston/winston";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (req: CustomRequest, _: Response, next: NextFunction): any => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw createHttpError(StatusCodes.UNAUTHORIZED, "Unauthorized", {
      resource: "Auth Middleware",
    });
  }

  const verify = verifyToken(token);
  req.loggedUser = verify.email || verify.username || verify.type;
  winstonLogger.defaultMeta = { loggedUser: verify.email || verify.username || verify.type };
  next();
};
