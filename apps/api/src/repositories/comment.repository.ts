import prisma from "../prisma";

type UserRole = "customer" | "agent" | "admin";

export const findAccessibleTicket = (
  ticketId: string,
  userId: string,
  role: UserRole
) => {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      ...(role === "customer" ? { customerId: userId } : {}),
    },
    select: { id: true },
  });
};

export const getCommentsForTicket = (ticketId: string) => {
  return prisma.comment.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const createTicketComment = (
  ticketId: string,
  authorId: string,
  content: string
) => {
  return prisma.comment.create({
    data: {
      ticketId,
      authorId,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};
