import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service";
import { AuthRequest } from "../auth.middleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    res.status(201).json({
      data: user,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json({
      data: result,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getCurrentUser(req.user!.userId);

    res.status(200).json({
      data: user,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};