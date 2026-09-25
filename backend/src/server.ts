import "dotenv/config";
import cluster from "cluster";
import os from "os";
import app from "@/app";

import { connectDB } from "@/config/db";
import { verifySMTP } from "@/utils/mailer";
import { seedDatabase } from "@/config/seeder";
import { initCurrencyCron } from "@/cron";

const PORT = process.env.PORT;
const numCPUs = os.cpus().length;

const isDev = process.env.NODE_ENV !== "production";

if (!isDev && cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Setting up ${numCPUs} workers for high concurrency...`);

  // Run DB Seed exactly ONCE before firing off the 8 Workers
  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      // Fork workers.
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
    });

  // Listen for dying workers to replace them
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In dev mode, this block runs directly on the primary process without clustering
  connectDB()
    .then(async () => {
      // If we are in Dev Mode, seed the DB locally on this single process
      if (isDev) {
        await seedDatabase();
      }
    })
    .then(() => verifySMTP())
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `[${isDev ? "Development" : "Worker"}] Process ${
            process.pid
          } running on http://localhost:${PORT}`,
        );
        initCurrencyCron();
      });
    });
}
