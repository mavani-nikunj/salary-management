import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { setupSwagger } from "./swagger";
import { sendResponse } from "./utils/response";

import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import salaryRoutes from "./routes/salary.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import departmentRoutes from "./routes/department.routes";
import countryRoutes from "./routes/country.routes";
import currencyRoutes from "./routes/currency.routes";
import { connectDB } from "./config/db";

const app: Express = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Cross Origin Resource Sharing
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev"));

// Root API Info Route
app.get("/", (_req: Request, res: Response) => {
  return sendResponse(res, 200, "Salary Management API is running", {
    name: "Salary Management API",
    version: "1.0.0",
    docs: "/api-docs",
    health: "/health",
  });
});

// Basic Health Check Route
app.get("/health", (req: Request, res: Response) => {
  return sendResponse(res, 200, "Server is healthy", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// Ensure database connection is active (vital for Vercel Serverless cold-starts & warm lambdas)
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Setup API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/currencies", currencyRoutes);

// Setup Swagger API Documentation
setupSwagger(app);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] - ${err.message}`);
  return sendResponse(res, 500, "Internal Server Error");
});

export default app;
