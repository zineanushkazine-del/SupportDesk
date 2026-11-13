import helmet from "helmet";
import cors from "cors";
import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import ticketRoutes from "./routes/ticket.routes";
import { requestLogger } from "./middleware";
import { errorHandler } from "./errorHandler";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";

const app = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

// Middleware
app.use(express.json());
app.use(requestLogger);

// Swagger UI uses inline initialization and styles; relax CSP only for docs.
app.use(
  "/docs",
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  })
);
app.get("/docs.json", (req: Request, res: Response) => {
  res.status(200).json(openApiDocument);
});
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, { customSiteTitle: "SupportDesk API Docs" })
);

// Routes
app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    data: {
      status: "OK",
      message: "SupportDesk API is running",
    },
    error: null,
    meta: null,
  });
});

// Central error handler
app.use(errorHandler);

export default app;