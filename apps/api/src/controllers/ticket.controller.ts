import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth.middleware";
import { validateTicketQuery } from "../services/ticket-query.validation";
import {
  fetchAllTickets,
  addTicket,
  editTicket,
  partiallyUpdateTicket,
} from "../services/ticket.service";

export const getTickets = async (
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

    const query = validateTicketQuery(req.query);
    const { tickets, total } = await fetchAllTickets(
      req.user.userId,
      req.user.role,
      query
    );

    res.status(200).json({
      data: tickets,
      error: null,
      meta: {
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const postTicket = async (
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

    const ticket = await addTicket(req.body, req.user.userId);

    res.status(201).json({
      data: ticket,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};

export const putTicket = async (
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

    const ticket = await editTicket(
      String(req.params.id),
      req.body,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      data: ticket,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};

export const patchTicket = async (
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

    const ticket = await partiallyUpdateTicket(
      String(req.params.id),
      req.body,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      data: ticket,
      error: null,
      meta: null,
    });
  } catch (error) {
    next(error);
  }
};