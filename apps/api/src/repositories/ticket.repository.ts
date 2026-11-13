import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { TicketQuery } from "../services/ticket-query.validation";

export const getAllTickets = async (
  userId: string,
  role: "customer" | "agent" | "admin",
  query: TicketQuery
) => {
  const where: Prisma.TicketWhereInput = {
    ...(role === "customer" ? { customerId: userId } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.priority !== undefined ? { priority: query.priority } : {}),
    ...(query.assigneeId !== undefined ? { assigneeId: query.assigneeId } : {}),
    ...(query.search !== undefined
      ? {
          OR: [
            { title: { contains: query.search } },
            { description: { contains: query.search } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.TicketOrderByWithRelationInput = {
    [query.sortBy ?? "createdAt"]: query.sortOrder,
  };
  const skip = (query.page - 1) * query.limit;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        tags: true,
      },
    }),
    prisma.ticket.count({ where }),
]);

  return { tickets, total };
};

export const createTicket = async (data: {
  title: string;
  description: string;
  priority?: "P1" | "P2" | "P3" | "P4";
  customerId: string;
}) => {
  return await prisma.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      customerId: data.customerId,
    },
  });
};

export const updateTicket = async (
  id: string,
  data: {
    title: string;
    description: string;
    priority: "P1" | "P2" | "P3" | "P4";
    status: "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
  },
  userId: string,
  role: "customer" | "agent" | "admin"
) => {
  return await prisma.ticket.update({
    where: {
      id,
      ...(role === "customer" ? { customerId: userId } : {}),
    },
    data,
  });
};

export const patchTicket = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: "P1" | "P2" | "P3" | "P4";
    status?: "open" | "in_progress" | "waiting_on_customer" | "resolved" | "closed";
  },
  userId: string,
  role: "customer" | "agent" | "admin"
) => {
  return await prisma.ticket.update({
    where: {
      id,
      ...(role === "customer" ? { customerId: userId } : {}),
    },
    data,
  });
};