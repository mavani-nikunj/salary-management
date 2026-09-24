import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "empthics HRMS API",
      version: "1.0.0",
      description: "API documentation for the empthics backend core.",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5009}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Automatically grab all route files to scan for swagger comments
  apis: ["./src/routes/*.ts", "./src/app.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger Page Route
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Expose the raw swagger.json
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `Swagger Docs available at http://localhost:${process.env.PORT || 5009}/api-docs`,
  );
};
