import "dotenv/config";
import { connectDB } from "@/config/db";
import { seedDatabase } from "@/config/seeder";

const run = async (): Promise<void> => {
  try {
    await connectDB();
    await seedDatabase();
    console.log("[Run-Seed] Seeding process finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("[Run-Seed] Seeding failed with error:", error);
    process.exit(1);
  }
};

run();
