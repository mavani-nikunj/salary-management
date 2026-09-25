import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { setupSwagger } from "@/swagger";
import { sendResponse } from "@/utils/response";

import authRoutes from "@/routes/auth.routes";
import employeeRoutes from "@/routes/employee.routes";
import salaryRoutes from "@/routes/salary.routes";
import reportRoutes from "@/routes/report.routes";
import dashboardRoutes from "@/routes/dashboard.routes";

const app: Express = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Cross Origin Resource Sharing
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("dev"));

// Basic Health Check Route
app.get("/health", (req: Request, res: Response) => {
  return sendResponse(res, 200, "Server is healthy", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// Setup API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Setup Swagger API Documentation
setupSwagger(app);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] - ${err.message}`);
  return sendResponse(res, 500, "Internal Server Error");
});

export default app;
