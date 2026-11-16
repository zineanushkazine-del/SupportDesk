# SupportDesk

A support ticket management system.

## Setup

Requirements: Node.js 18 or later and npm.

```sh
npm ci
```

## Build

Compile the TypeScript sources to `dist/`:

```sh
npm run build
```

## Test

Run the Jest suite:

```sh
npm.cmd test -- --runInBand
```

## Ticket CSV CLI

Import a CSV file and print the resulting tickets as formatted JSON:

```sh
npm start -- samples/support-tickets.csv
```

The CSV must include `title`, `description`, and `priority` columns. Headers are
case-insensitive; quoted fields, commas in quoted values, and escaped quotes
are supported. Each imported ticket receives a sequential ID such as
`TKT-0001`. The command builds the project before running the CLI.

## Project Goal

Help customers report problems and track their support tickets.

## Features

- Create support tickets
- Track ticket status
- Assign tickets to support agents
- Search and manage tickets
