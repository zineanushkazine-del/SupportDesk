import {
  createTicketComment,
  findAccessibleTicket,
  getCommentsForTicket,
} from "../repositories/comment.repository";

type UserRole = "customer" | "agent" | "admin";

export const listTicketComments = async (
  ticketId: string,
  userId: string,
  role: UserRole
) => {
  const ticket = await findAccessibleTicket(ticketId, userId, role);

  if (!ticket) {
    return null;
  }

  return getCommentsForTicket(ticketId);
};

export const addTicketComment = async (
  ticketId: string,
  content: string,
  authorId: string,
  role: UserRole
) => {
  const ticket = await findAccessibleTicket(ticketId, authorId, role);

  if (!ticket) {
    return null;
  }

  return createTicketComment(ticketId, authorId, content);
};
