import { PrismaClient, TicketPriority } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { csvToTickets } from "../../../../src/ticket";

const prisma = new PrismaClient();

async function main() {
  const csvPath = resolve(
    process.cwd(),
    "samples/support-tickets.csv"
  );

  const csv = readFileSync(csvPath, "utf8");
  const tickets = csvToTickets(csv);

  if (tickets.length !== 50) {
    throw new Error(`Expected 50 tickets, found ${tickets.length}`);
  }

  const existingCount = await prisma.ticket.count();

  if (existingCount > 0) {
    throw new Error(
      `Database already contains ${existingCount} tickets. Seed stopped to avoid duplicates.`
    );
  }

  const customer = await prisma.user.upsert({
    where: { email: "seed.customer@supportdesk.test" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "seed.customer@supportdesk.test",
      passwordHash: "seed-only-demo-password",,
      role: "customer",
    },
  });

  const priorityMap: Record<string, TicketPriority> = {
    high: "P1",
    medium: "P2",
    low: "P3",
  };

  const ticketData = tickets.map((ticket) => {
    const priority = priorityMap[ticket.priority.toLowerCase()];

    if (!priority) {
      throw new Error(`Invalid priority: ${ticket.priority}`);
    }

    return {
      title: ticket.title,
      description: ticket.description,
      priority,
      customerId: customer.id,
    };
  });

  await prisma.ticket.createMany({
    data: ticketData,
  });

  const total = await prisma.ticket.count();

  console.log(`Successfully seeded ${total} tickets.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });