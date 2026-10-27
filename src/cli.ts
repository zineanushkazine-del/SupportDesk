import { readFileSync } from "node:fs";
import { csvToTickets } from "./ticket";

const csvPath = process.argv[2];

if (!csvPath) {
  console.error("Usage: npm start -- <tickets.csv>");
  process.exitCode = 1;
} else {
  try {
    const csv = readFileSync(csvPath, "utf8");
    const tickets = csvToTickets(csv);
    console.log(JSON.stringify(tickets, null, 2));
  } catch (error) {
    console.error(
      `Could not import tickets: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exitCode = 1;
  }
}
