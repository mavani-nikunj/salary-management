"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const app_1 = __importDefault(require("./app.js"));
const db_1 = require("./config/db.js");
const mailer_1 = require("./utils/mailer.js");
const seeder_1 = require("./config/seeder.js");
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 5022;
const numCPUs = os_1.default.cpus().length;
const isDev = process.env.NODE_ENV !== "production";
if (!isDev && cluster_1.default.isPrimary) {
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Setting up ${numCPUs} workers for high concurrency...`);
    // Run DB Seed exactly ONCE before firing off the 8 Workers
    (0, db_1.connectDB)()
        .then(() => (0, seeder_1.seedDatabase)())
        .then(() => {
        // Fork workers.
        for (let i = 0; i < numCPUs; i++) {
            cluster_1.default.fork();
        }
    });
    // Listen for dying workers to replace them
    cluster_1.default.on("exit", (worker, code, signal) => {
        console.log(`Worker process ${worker.process.pid} died. Restarting...`);
        cluster_1.default.fork();
    });
}
else {
    // Workers can share any TCP connection
    // In dev mode, this block runs directly on the primary process without clustering
    (0, db_1.connectDB)()
        .then(async () => {
        // If we are in Dev Mode, seed the DB locally on this single process
        if (isDev) {
            await (0, seeder_1.seedDatabase)();
        }
    })
        .then(() => (0, mailer_1.verifySMTP)())
        .then(() => {
        app_1.default.listen(PORT, () => {
            console.log(`[${isDev ? "Development" : "Worker"}] Process ${process.pid} running on http://localhost:${PORT}`);
        });
    });
}
