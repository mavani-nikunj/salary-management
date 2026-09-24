"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_1 = require("./config/swagger.js");
const response_1 = require("./utils/response.js");
const auth_routes_1 = __importDefault(require("./routes/auth.routes.js"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Cross Origin Resource Sharing
app.use((0, compression_1.default)()); // Compress responses
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, morgan_1.default)("dev"));
// Basic Health Check Route
app.get("/health", (req, res) => {
    return (0, response_1.sendResponse)(res, 200, "Server is healthy", {
        status: "healthy",
        timestamp: new Date().toISOString(),
        pid: process.pid,
    });
});
// Setup API Routes
app.use("/api/auth", auth_routes_1.default);
// Setup Swagger API Documentation
(0, swagger_1.setupSwagger)(app);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Error] - ${err.message}`);
    return (0, response_1.sendResponse)(res, 500, "Internal Server Error");
});
exports.default = app;
