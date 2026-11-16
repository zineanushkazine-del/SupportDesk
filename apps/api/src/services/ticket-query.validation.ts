import { TicketPriority, TicketStatus } from "@prisma/client";
import { z } from "zod";

const positiveIntegerQuery = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(1)
      .max(Number.MAX_SAFE_INTEGER)
  );

const ticketQuerySchema = z.object({
  page: positiveIntegerQuery.optional(),
  limit: positiveIntegerQuery.refine((value) => value <= 100).optional(),
  status: z.enum(TicketStatus).optional(),
  priority: z.enum(TicketPriority).optional(),
  assigneeId: z.string().optional(),
  search: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "priority", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type TicketQuery = {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status";
  sortOrder: "asc" | "desc";
};

export const validateTicketQuery = (query: unknown): TicketQuery => {
  const parsed = ticketQuerySchema.parse(query);

  return {
    page: parsed.page ?? 1,
    limit: parsed.limit ?? 10,
    ...(parsed.status !== undefined && { status: parsed.status }),
    ...(parsed.priority !== undefined && { priority: parsed.priority }),
    ...(parsed.assigneeId !== undefined && { assigneeId: parsed.assigneeId }),
    ...(parsed.search !== undefined && { search: parsed.search }),
    ...(parsed.sortBy !== undefined && { sortBy: parsed.sortBy }),
    sortOrder: parsed.sortOrder ?? "desc",
  };
};
