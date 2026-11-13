import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import type { PrismaClient } from "@prisma/client";
import type { Express } from "express";
import request from "supertest";

const originalDatabaseUrl = process.env.DATABASE_URL;
const testUserIds: string[] = [];

let app: Express;
let prisma: PrismaClient;

const databaseTarget = (connectionString: string): string => {
  let url: URL;

  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL connection URL");
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("TEST_DATABASE_URL must use PostgreSQL");
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

  if (!databaseName) {
    throw new Error("TEST_DATABASE_URL must specify a database name");
  }

  return `${url.hostname.toLowerCase()}:${url.port || "5432"}/${databaseName}`;
};

const assertTestDatabaseIsIsolated = (): string => {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL is required to run API integration tests");
  }

  const testTarget = databaseTarget(testDatabaseUrl);
  const testDatabaseName = testTarget.slice(testTarget.lastIndexOf("/") + 1);

  if (testDatabaseName !== "supportdesk_test") {
    throw new Error(
      "Integration tests may only use the dedicated supportdesk_test database"
    );
  }

  const workspaceRoot = path.resolve(__dirname, "../../../..");
  const envFilePath = path.join(workspaceRoot, ".env");
  const dotenvValues = existsSync(envFilePath)
    ? dotenv.parse(readFileSync(envFilePath))
    : {};
  const developmentUrls = [
    originalDatabaseUrl,
    dotenvValues.DATABASE_URL,
  ].filter((value): value is string => Boolean(value?.trim()));

  for (const developmentUrl of developmentUrls) {
    if (databaseTarget(developmentUrl) === testTarget) {
      throw new Error(
        "TEST_DATABASE_URL points to the configured development database"
      );
    }
  }

  return testDatabaseUrl;
};

const registerCustomer = async (): Promise<{
  id: string;
  token: string;
}> => {
  const email = `integration-${randomUUID()}@example.test`;
  const password = "Integration-test-password-123!";
  const registration = await request(app)
    .post("/auth/register")
    .send({ name: "Integration Customer", email, password });

  expect(registration.status).toBe(201);
  expect(registration.body).toMatchObject({
    data: { email },
    error: null,
    meta: null,
  });

  const userId = registration.body.data.id as string;
  testUserIds.push(userId);

  const login = await request(app)
    .post("/auth/login")
    .send({ email, password });

  expect(login.status).toBe(200);
  expect(login.body).toMatchObject({
    data: {
      user: { id: userId },
      token: expect.any(String),
    },
    error: null,
    meta: null,
  });

  return { id: userId, token: login.body.data.token as string };
};

beforeAll(async () => {
  const testDatabaseUrl = assertTestDatabaseIsIsolated();
  process.env.DATABASE_URL = testDatabaseUrl;

  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = "supportdesk-integration-test-secret-32chars";
  }

  const [appModule, prismaModule] = await Promise.all([
    import("../app"),
    import("../prisma"),
  ]);
  app = appModule.default;
  prisma = prismaModule.default;

  await prisma.$connect();
});

afterAll(async () => {
  try {
    if (prisma && testUserIds.length > 0) {
      await prisma.comment.deleteMany({
        where: { authorId: { in: testUserIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.ticket.deleteMany({
        where: { customerId: { in: testUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      });
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  }
});

describe("SupportDesk API integration", () => {
  it("returns the health response envelope", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: { status: "OK" },
      error: null,
      meta: null,
    });
  });

  it("registers and authenticates a customer", async () => {
    const customer = await registerCustomer();

    expect(customer.id).toEqual(expect.any(String));
    expect(customer.token).toEqual(expect.any(String));
  });

  it("requires authentication for ticket endpoints", async () => {
    const response = await request(app).get("/tickets");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      data: null,
      error: { message: expect.any(String) },
      meta: null,
    });
  });

  it("creates a ticket for the authenticated customer", async () => {
    const customer = await registerCustomer();
    const response = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${customer.token}`)
      .send({
        title: "Integration test ticket",
        description: "Created through the API integration test.",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      data: {
        title: "Integration test ticket",
        description: "Created through the API integration test.",
        customerId: customer.id,
      },
      error: null,
      meta: null,
    });
  });

  it("lists only the authenticated customer's tickets", async () => {
    const [customer, otherCustomer] = await Promise.all([
      registerCustomer(),
      registerCustomer(),
    ]);

    const ownTicket = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${customer.token}`)
      .send({
        title: "Owned integration ticket",
        description: "Visible to its customer.",
      });
    const otherTicket = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${otherCustomer.token}`)
      .send({
        title: "Other integration ticket",
        description: "Not visible to the first customer.",
      });

    expect(ownTicket.status).toBe(201);
    expect(otherTicket.status).toBe(201);

    const response = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${customer.token}`);

    expect(response.status).toBe(200);
    expect(response.body.error).toBeNull();
    expect(response.body.meta.total).toBe(1);
    expect(response.body.data.map((ticket: { id: string }) => ticket.id)).toEqual([
      ownTicket.body.data.id,
    ]);
  });

  it("does not allow customers to update tickets", async () => {
    const customer = await registerCustomer();
    const ticket = await request(app)
      .post("/tickets")
      .set("Authorization", `Bearer ${customer.token}`)
      .send({
        title: "Customer-owned ticket",
        description: "Customers cannot update tickets.",
      });

    expect(ticket.status).toBe(201);

    const response = await request(app)
      .patch(`/tickets/${ticket.body.data.id}`)
      .set("Authorization", `Bearer ${customer.token}`)
      .send({ title: "Changed title" });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      data: null,
      error: { message: expect.any(String) },
      meta: null,
    });
  });
});
