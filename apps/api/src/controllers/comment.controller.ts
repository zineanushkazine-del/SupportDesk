import { NextFunction, Response } from "express";
import { AuthRequest } from "../auth.middleware";
import {
  addTicketComment,
  listTicketComments,
} from "../services/comment.service";
import { validateCreateComment } from "../services/comment.validation";

export const getTicketComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: { message: "Authentication required" },
        meta: null,
      });
      return;
    }

    const ticketId = String(req.params.ticketId);
    const comments = await listTicketComments(
      ticketId,
      req.user.userId,
      req.user.role
    );

    if (!comments) {
      res.status(404).json({
        data: null,
        error: { message: "Ticket not found" },
        meta: null,
      });
      return;
    }

    res.status(200).json({
      data: comments,
      error: null,
      meta: { total: comments.length },
    });
  } catch (error) {
    next(error);
  }
};

export const postTicketComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: { message: "Authentication required" },
        meta: null,
      });
      return;
    }

    const { content } = validateCreateComment(req.body);
    const comment = await addTicketComment(
      String(req.params.ticketId),
      content,
      req.user.userId,
      req.user.role
    );

    if (!comment) {
      res.status(404).json({
        data: null,
        error: { message: "Ticket not found" },
        meta: null,
      });
      return;
    }

    res.status(201).json({
      data: comment,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};
