import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors.js";
import { HTTP_STATUS } from "../common/httpStatus.js";

export function errorHandler(
  err: Error,
  _req: Request,
    res: Response,
    _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    console.error("Unexpected error:", err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
    });
  }
}
