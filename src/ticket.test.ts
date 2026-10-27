import { csvToTickets, generateTicketId } from "./ticket";

describe("generateTicketId", () => {
  it("formats ticket IDs with a four-digit sequence", () => {
    expect(generateTicketId(7)).toBe("TKT-0007");
  });

  it("produces unique IDs for distinct sequence numbers", () => {
    const ids = [1, 2, 3, 10].map(generateTicketId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("rejects invalid sequence numbers", () => {
    expect(() => generateTicketId(0)).toThrow(
      "Ticket ID sequence must be a positive safe integer"
    );
    expect(() => generateTicketId(1.5)).toThrow(RangeError);
  });
});

describe("csvToTickets", () => {
  it("converts valid CSV records into JSON-compatible tickets", () => {
    expect(
      csvToTickets(
        "title,description,priority\nLogin issue,Unable to sign in,high"
      )
    ).toEqual([
      {
        id: "TKT-0001",
        title: "Login issue",
        description: "Unable to sign in",
        priority: "high",
      },
    ]);
  });

  it("creates distinct IDs for every converted ticket", () => {
    const tickets = csvToTickets(
      "title,description,priority\nFirst,Details,low\nSecond,Details,high"
    );
    expect(tickets.map((ticket) => ticket.id)).toEqual([
      "TKT-0001",
      "TKT-0002",
    ]);
    expect(new Set(tickets.map((ticket) => ticket.id)).size).toBe(2);
  });

  it("supports case-insensitive headers, reordered columns, and quoted commas", () => {
    expect(
      csvToTickets(
        'Priority,TITLE,Description\nhigh,Login,"Cannot sign in, even with correct password"'
      )
    ).toEqual([
      {
        id: "TKT-0001",
        title: "Login",
        description: "Cannot sign in, even with correct password",
        priority: "high",
      },
    ]);
  });

  it("returns an empty list for empty input", () => {
    expect(csvToTickets(" \r\n ")).toEqual([]);
  });

  it("reports all missing required columns", () => {
    expect(() => csvToTickets("title,description\nIssue,Details")).toThrow(
      "Missing required columns: priority"
    );
  });

  it("rejects rows with a different number of values than headers", () => {
    expect(() =>
      csvToTickets("title,description,priority\nIssue,Details")
    ).toThrow("Malformed CSV row: 2");
  });

  it("rejects empty required fields", () => {
    expect(() =>
      csvToTickets("title,description,priority\nIssue,,high")
    ).toThrow("Required field is empty in row 2");
  });

  it("rejects unterminated quoted fields", () => {
    expect(() =>
      csvToTickets('title,description,priority\nIssue,"Not closed,high')
    ).toThrow("Malformed CSV row: 2");
  });

  it("rejects non-string input", () => {
    expect(() => csvToTickets(null)).toThrow("CSV input must be a string");
  });
});
