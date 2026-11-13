import {
  getAllTickets,
  createTicket,
  updateTicket,
  patchTicket,
} from "../repositories/ticket.repository";
import { TicketQuery } from "./ticket-query.validation";

type UserRole = "customer" | "agent" | "admin";

export const fetchAllTickets = async (
  userId: string,
  role: UserRole,
  query: TicketQuery
) => {
  return await getAllTickets(userId, role, query);
};

export const addTicket = async (
  data: {
    title: string;
    description: string;
    priority?: "P1" | "P2" | "P3" | "P4";
  },
  customerId: string
) => {
  return await createTicket({
    ...data,
    customerId,
  });
};

export const editTicket = async (
  id: string,
  data: {
    title: string;
    description: string;
    priority: "P1" | "P2" | "P3" | "P4";
    status: "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
  },
  userId: string,
  role: UserRole
) => {
  return await updateTicket(id, data, userId, role);
};

export const partiallyUpdateTicket = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: "P1" | "P2" | "P3" | "P4";
    status?: "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
  },
  userId: string,
  role: UserRole
) => {
  return await patchTicket(id, data, userId, role);
};