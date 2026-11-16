import { UserRole } from "@prisma/client";
import {
  createTicketComment,
  findAccessibleTicket,
  getCommentsForTicket,
} from "../repositories/comment.repository";
import {
  addTicketComment,
  listTicketComments,
} from "./comment.service";

jest.mock("../repositories/comment.repository", () => ({
  createTicketComment: jest.fn(),
  findAccessibleTicket: jest.fn(),
  getCommentsForTicket: jest.fn(),
}));
const mockFindAccessibleTicket = jest.mocked(findAccessibleTicket);
const mockGetCommentsForTicket = jest.mocked(getCommentsForTicket);
const mockCreateTicketComment = jest.mocked(createTicketComment);

const comment = {
  id: "comment-1",
  content: "Please try again.",
  createdAt: new Date("2026-11-13T00:00:00.000Z"),
  ticketId: "ticket-1",
  authorId: "customer-1",
  author: {
    id: "customer-1",
    name: "Customer",
    email: "customer@example.com",
    role: UserRole.customer,
  },
};

describe("ticket comment service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists comments after confirming customer ticket ownership", async () => {
    mockFindAccessibleTicket.mockResolvedValue({ id: "ticket-1" });
    mockGetCommentsForTicket.mockResolvedValue([comment]);

    await expect(
      listTicketComments("ticket-1", "customer-1", "customer")
    ).resolves.toEqual([comment]);
    expect(mockFindAccessibleTicket).toHaveBeenCalledWith(
      "ticket-1",
      "customer-1",
      "customer"
    );
    expect(mockGetCommentsForTicket).toHaveBeenCalledWith("ticket-1");
  });

  it.each([UserRole.agent, UserRole.admin])(
    "allows %s to list comments for any accessible ticket",
    async (role) => {
      mockFindAccessibleTicket.mockResolvedValue({ id: "ticket-1" });
      mockGetCommentsForTicket.mockResolvedValue([comment]);

      await expect(
        listTicketComments("ticket-1", "staff-1", role)
      ).resolves.toEqual([comment]);
      expect(mockFindAccessibleTicket).toHaveBeenCalledWith(
        "ticket-1",
        "staff-1",
        role
      );
    }
  );

  it("does not return comments when a customer does not own the ticket", async () => {
    mockFindAccessibleTicket.mockResolvedValue(null);

    await expect(
      listTicketComments("ticket-1", "customer-2", "customer")
    ).resolves.toBeNull();
    expect(mockGetCommentsForTicket).not.toHaveBeenCalled();
  });

  it("creates a comment using the authenticated user as author", async () => {
    mockFindAccessibleTicket.mockResolvedValue({ id: "ticket-1" });
    mockCreateTicketComment.mockResolvedValue(comment);

    await expect(
      addTicketComment(
        "ticket-1",
        "Please try again.",
        "customer-1",
        "customer"
      )
    ).resolves.toEqual(comment);
    expect(mockFindAccessibleTicket).toHaveBeenCalledWith(
      "ticket-1",
      "customer-1",
      "customer"
    );
    expect(mockCreateTicketComment).toHaveBeenCalledWith(
      "ticket-1",
      "customer-1",
      "Please try again."
    );
  });

  it("does not create a comment when a customer does not own the ticket", async () => {
    mockFindAccessibleTicket.mockResolvedValue(null);

    await expect(
      addTicketComment("ticket-1", "Not allowed", "customer-2", "customer")
    ).resolves.toBeNull();
    expect(mockCreateTicketComment).not.toHaveBeenCalled();
  });
});
