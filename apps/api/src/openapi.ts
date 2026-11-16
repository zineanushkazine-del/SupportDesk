import { TicketPriority, TicketStatus, UserRole } from "@prisma/client";

const errorResponse = {
  description: "Error response",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiErrorResponse" },
    },
  },
};

const apiResponse = (description: string, schemaName: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaName}` },
    },
  },
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "SupportDesk API",
    version: "1.0.0",
    description: "API documentation for the existing SupportDesk endpoints.",
  },
  paths: {
    "/health": {
      get: {
        summary: "Check API health",
        responses: {
          "200": apiResponse("API is running", "HealthResponse"),
        },
      },
    },
    "/auth/register": {
      post: {
        summary: "Register a customer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": apiResponse("User registered", "UserResponse"),
          "409": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Authenticate and receive a bearer token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": apiResponse("Login successful", "LoginResponse"),
          "401": errorResponse,
          "429": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/tickets": {
      get: {
        summary: "List tickets",
        description:
          "Customers receive only their own tickets. The total is counted before pagination.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: Object.values(TicketStatus) },
          },
          {
            name: "priority",
            in: "query",
            schema: { type: "string", enum: Object.values(TicketPriority) },
          },
          {
            name: "assigneeId",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "search",
            in: "query",
            description: "Searches ticket title and description.",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "updatedAt", "priority", "status"],
              default: "createdAt",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          "200": apiResponse("Tickets matching the query", "TicketListResponse"),
          "400": errorResponse,
          "401": errorResponse,
          "500": errorResponse,
        },
      },
      post: {
        summary: "Create a ticket for the authenticated user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTicketRequest" },
            },
          },
        },
        responses: {
          "201": apiResponse("Ticket created", "TicketResponse"),
          "401": errorResponse,
          "500": errorResponse,
        },
      },
    },
    "/tickets/{id}": {
      put: {
        summary: "Replace a ticket",
        description: "Restricted to agents and admins.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReplaceTicketRequest" },
            },
          },
          "/tickets/{ticketId}/comments": {
            get: {
              summary: "List comments for a ticket",
              description:
                "Customers can access comments only on their own tickets. Agents and admins can access all tickets.",
              security: [{ bearerAuth: [] }],
              parameters: [
                {
                  name: "ticketId",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              responses: {
                "200": apiResponse("Comments for the ticket", "CommentListResponse"),
                "401": errorResponse,
                "404": errorResponse,
                "500": errorResponse,
              },
            },
            post: {
              summary: "Add a comment to a ticket",
              description:
                "The comment author is always the authenticated user. Customers can comment only on their own tickets.",
              security: [{ bearerAuth: [] }],
              parameters: [
                {
                  name: "ticketId",
                  in: "path",
                  required: true,
                  schema: { type: "string" },
                },
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/CreateCommentRequest" },
                  },
                },
              },
              responses: {
                "201": apiResponse("Comment created", "CommentResponse"),
                "400": errorResponse,
                "401": errorResponse,
                "404": errorResponse,
                "500": errorResponse,
              },
            },
          },
        },
        responses: {
          "200": apiResponse("Ticket updated", "TicketResponse"),
          "401": errorResponse,
          "403": errorResponse,
          "500": errorResponse,
        },
      },
      patch: {
        summary: "Partially update a ticket",
        description: "Restricted to agents and admins.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTicketRequest" },
            },
          },
        },
        responses: {
          "200": apiResponse("Ticket updated", "TicketResponse"),
          "401": errorResponse,
          "403": errorResponse,
          "500": errorResponse,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiErrorResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: { type: "object", nullable: true },
          error: {
            type: "object",
            required: ["message"],
            properties: { message: { type: "string" } },
          },
          meta: { type: "object", nullable: true },
        },
      },
      HealthResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: {
            type: "object",
            required: ["status", "message"],
            properties: {
              status: { type: "string", example: "OK" },
              message: { type: "string" },
            },
          },
          error: { type: "object", nullable: true },
          meta: { type: "object", nullable: true },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      User: {
        type: "object",
        required: ["id", "name", "email", "role"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: Object.values(UserRole) },
        },
      },
      UserResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: { $ref: "#/components/schemas/User" },
          error: { type: "object", nullable: true },
          meta: { type: "object", nullable: true },
        },
      },
      LoginResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: {
            type: "object",
            required: ["user", "token"],
            properties: {
              user: { $ref: "#/components/schemas/User" },
              token: { type: "string" },
            },
          },
          error: { type: "object", nullable: true },
          meta: { type: "object", nullable: true },
        },
      },
      CreateTicketRequest: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: Object.values(TicketPriority) },
        },
      },
      ReplaceTicketRequest: {
        type: "object",
        required: ["title", "description", "priority", "status"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: Object.values(TicketPriority) },
          status: { type: "string", enum: Object.values(TicketStatus) },
        },
      },
      UpdateTicketRequest: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: Object.values(TicketPriority) },
          status: { type: "string", enum: Object.values(TicketStatus) },
        },
      },
      Ticket: {
        type: "object",
        required: [
          "id",
          "title",
          "description",
          "status",
          "priority",
          "createdAt",
          "updatedAt",
          "customerId",
          "assigneeId",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          status: { type: "string", enum: Object.values(TicketStatus) },
          priority: { type: "string", enum: Object.values(TicketPriority) },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          customerId: { type: "string" },
          assigneeId: { type: "string", nullable: true },
        },
      },
      TicketListItem: {
        allOf: [
          { $ref: "#/components/schemas/Ticket" },
          {
            type: "object",
            required: ["customer", "assignee", "tags"],
            properties: {
              customer: { $ref: "#/components/schemas/User" },
              assignee: {
                allOf: [{ $ref: "#/components/schemas/User" }],
                nullable: true,
              },
              tags: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "name"],
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      },
      TicketResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: { $ref: "#/components/schemas/Ticket" },
          error: { type: "object", nullable: true },
          meta: { type: "object", nullable: true },
        },
      },
      TicketListResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/TicketListItem" },
          },
          error: { type: "object", nullable: true },
          meta: {
            type: "object",
            required: ["total"],
            properties: { total: { type: "integer", minimum: 0 } },
          },
        },
      },
      CreateCommentRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", minLength: 1 },
        },
      },
      Comment: {
        type: "object",
        required: ["id", "content", "createdAt", "ticketId", "authorId", "author"],
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          ticketId: { type: "string" },
          authorId: { type: "string" },
          author: { $ref: "#/components/schemas/User" },
        },
      },
      CommentResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: { $ref: "#/components/schemas/Comment" },
          error: { type: "object", nullable: true },
          meta: { type: "object", nullable: true },
        },
      },
      CommentListResponse: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Comment" },
          },
          error: { type: "object", nullable: true },
          meta: {
            type: "object",
            required: ["total"],
            properties: { total: { type: "integer", minimum: 0 } },
          },
        },
      },
    },
  },
};
