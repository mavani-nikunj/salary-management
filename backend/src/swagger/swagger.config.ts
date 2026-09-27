import "dotenv/config";
import { Options } from "swagger-jsdoc";
import { swaggerSchemas } from "./schemas";

import path from "path";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ACME Salary Management API",
      version: "1.0.0",
      description:
        "High-performance REST API documentation for ACME Organization Employee Salary Management System.",
      contact: {
        name: "API Support",
        email: "support@acme.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5022}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: swaggerSchemas,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "../routes/*.{ts,js}"),
    path.join(__dirname, "../routes/**/*.{ts,js}"),
    path.join(__dirname, "../app.{ts,js}"),
  ],
};

export default swaggerOptions;
