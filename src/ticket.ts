export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
}

const REQUIRED_HEADERS = ["title", "description", "priority"] as const;

export function csvToTickets(csv: unknown): Ticket[] {
  if (typeof csv !== "string") {
    throw new TypeError("CSV input must be a string");
  }
  if (!csv.trim()) {
    return [];
  }

  const rows = parseCsv(csv);
  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header)
      .trim()
      .toLowerCase()
  );
  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index
  );
  if (duplicateHeaders.length > 0) {
    throw new Error(`Duplicate CSV column: ${duplicateHeaders[0]}`);
  }

  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  return rows.slice(1).map((values, index) => {
    const rowNumber = index + 2;
    if (values.length !== headers.length) {
      throw new Error(`Malformed CSV row: ${rowNumber}`);
    }

    const record = new Map(headers.map((header, column) => [header, values[column]]));
    const title = record.get("title")?.trim();
    const description = record.get("description")?.trim();
    const priority = record.get("priority")?.trim();

    if (!title || !description || !priority) {
      throw new Error(`Required field is empty in row ${rowNumber}`);
    }

    return {
      id: generateTicketId(index + 1),
      title,
      description,
      priority,
    };
  });
}

export function generateTicketId(sequence: number): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1) {
    throw new RangeError("Ticket ID sequence must be a positive safe integer");
  }
  return `TKT-${String(sequence).padStart(4, "0")}`;
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;
  let line = 1;
  let recordStartLine = 1;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (inQuotes) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else if (character === "\r" || character === "\n") {
        field += "\n";
        if (character === "\r" && csv[index + 1] === "\n") {
          index += 1;
        }
        line += 1;
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote) {
      if (character === ",") {
        row.push(field);
        field = "";
        afterQuote = false;
      } else if (character === "\r" || character === "\n") {
        row.push(field);
        appendNonEmptyRow(rows, row);
        row = [];
        field = "";
        afterQuote = false;
        if (character === "\r" && csv[index + 1] === "\n") {
          index += 1;
        }
        line += 1;
        recordStartLine = line;
      } else if (character !== " " && character !== "\t") {
        throw new Error(`Malformed CSV row: ${recordStartLine}`);
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) {
        throw new Error(`Malformed CSV row: ${recordStartLine}`);
      }
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\r" || character === "\n") {
      row.push(field);
      appendNonEmptyRow(rows, row);
      row = [];
      field = "";
      if (character === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
      line += 1;
      recordStartLine = line;
    } else {
      field += character;
    }
  }

  if (inQuotes) {
    throw new Error(`Malformed CSV row: ${recordStartLine}`);
  }
  if (field.length > 0 || row.length > 0 || afterQuote) {
    row.push(field);
    appendNonEmptyRow(rows, row);
  }
  return rows;
}

function appendNonEmptyRow(rows: string[][], row: string[]): void {
  if (row.some((value) => value.trim().length > 0)) {
    rows.push(row);
  }
}
