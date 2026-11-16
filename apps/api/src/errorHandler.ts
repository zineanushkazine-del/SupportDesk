import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);

  let statusCode = 500;

  if (err instanceof ZodError) {
    statusCode = 400;
  } else if (err.message === "Invalid email or password") {
    statusCode = 401;
  } else if (err.message === "Email already registered") {
    statusCode = 409;
  }

  res.status(statusCode).json({
    data: null,
    error: {
      message: err.message || "Internal Server Error",
    },
    meta: null,
  });
}