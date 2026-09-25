import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { swaggerOptions } from "./swagger.config";

export const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Express): void => {
  const port = process.env.PORT;

  // Swagger Documentation UI Route
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "ACME Salary Management API Docs",
    }),
  );

  // Raw OpenAPI JSON specification endpoint
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
};

export * from "./swagger.config";
export * from "./schemas";
export default setupSwagger;
