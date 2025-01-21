import { Request } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const createResponse = (
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  message: string = ReasonPhrases.OK,
  status: number = StatusCodes.OK,
) => {
  return {
    status,
    message,
    method: req.method,
    url: req.originalUrl,
    data,
  };
};
