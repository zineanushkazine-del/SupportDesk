import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "customer" | "agent" | "admin";
  };
}

interface JwtPayload {
  userId: string;
  role: "customer" | "agent" | "admin";
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        data: null,
        error: { message: "Authentication token required" },
        meta: null,
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid authentication token" },
        meta: null,
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (
      typeof decoded.userId !== "string" ||
      !["customer", "agent", "admin"].includes(decoded.role)
    ) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid authentication token" },
        meta: null,
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      data: null,
      error: { message: "Invalid or expired authentication token" },
      meta: null,
    });
  }
};

export const requireRole = (
  ...allowedRoles: Array<"customer" | "agent" | "admin">
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        error: { message: "You do not have permission to access this resource" },
        meta: null,
      });
      return;
    }

    next();
  };
};