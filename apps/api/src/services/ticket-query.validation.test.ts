import { TicketPriority, TicketStatus } from "@prisma/client";
import { validateTicketQuery } from "./ticket-query.validation";

describe("validateTicketQuery", () => {
  it("applies defaults when no query parameters are provided", () => {
    expect(validateTicketQuery({})).toEqual({
      page: 1,
      limit: 10,
      sortOrder: "desc",
    });
  });

  it("parses page and limit and preserves optional filters", () => {
    expect(
      validateTicketQuery({
        page: "3",
        limit: "25",
        status: TicketStatus.in_progress,
        priority: TicketPriority.P2,
        assigneeId: "agent-123",
        search: "  printer issue  ",
        sortBy: "updatedAt",
        sortOrder: "asc",
      })
    ).toEqual({
      page: 3,
      limit: 25,
      status: TicketStatus.in_progress,
      priority: TicketPriority.P2,
      assigneeId: "agent-123",
      search: "printer issue",
      sortBy: "updatedAt",
      sortOrder: "asc",
    });
  });

  it("accepts every Prisma TicketStatus value", () => {
    for (const status of Object.values(TicketStatus)) {
      expect(validateTicketQuery({ status }).status).toBe(status);
    }
  });

  it("accepts every Prisma TicketPriority value", () => {
    for (const priority of Object.values(TicketPriority)) {
      expect(validateTicketQuery({ priority }).priority).toBe(priority);
    }
  });

  it.each(["createdAt", "updatedAt", "priority", "status"])(
    "accepts approved sort field %s",
    (sortBy) => {
      expect(validateTicketQuery({ sortBy }).sortBy).toBe(sortBy);
    }
  );

  it.each(["asc", "desc"])("accepts sortOrder %s", (sortOrder) => {
    expect(validateTicketQuery({ sortOrder }).sortOrder).toBe(sortOrder);
  });

  it("omits search when it is empty or whitespace-only", () => {
    expect(validateTicketQuery({ search: "   " })).toEqual({
      page: 1,
      limit: 10,
      sortOrder: "desc",
    });
  });

  it.each([
    ["page", "abc"],
    ["page", "0"],
    ["page", "-1"],
    ["page", "1.5"],
    ["page", "9007199254740992"],
    ["limit", "abc"],
    ["limit", "0"],
    ["limit", "-1"],
    ["limit", "1.5"],
    ["limit", "101"],
  ])("rejects invalid numeric parameter %s=%s", (key, value) => {
    expect(() => validateTicketQuery({ [key]: value })).toThrow();
  });

  it.each([
    ["status", "not-a-status"],
    ["priority", "P0"],
    ["sortBy", "customerId"],
    ["sortBy", "createdAt desc"],
    ["sortBy", "createdAt; DROP TABLE Ticket"],
    ["sortOrder", "ascending"],
  ])("rejects unsupported query value %s=%s", (key, value) => {
    expect(() => validateTicketQuery({ [key]: value })).toThrow();
  });

  it.each([
    "page",
    "limit",
    "status",
    "priority",
    "assigneeId",
    "search",
    "sortBy",
    "sortOrder",
  ])("rejects array/repeated values for %s", (key) => {
    expect(() => validateTicketQuery({ [key]: ["first", "second"] })).toThrow();
  });

  it("accepts boundary values page=1, limit=1, and limit=100", () => {
    expect(validateTicketQuery({ page: "1", limit: "1" })).toMatchObject({
      page: 1,
      limit: 1,
    });
    expect(validateTicketQuery({ limit: "100" }).limit).toBe(100);
  });

  it("trims search text without interpreting SQL-like text", () => {
    const search = "  ' OR 1=1 --  ";

    expect(validateTicketQuery({ search })).toMatchObject({
      search: "' OR 1=1 --",
    });
  });
});
