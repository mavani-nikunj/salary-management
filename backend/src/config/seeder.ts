export const seedDatabase = async () => {
  try {
    console.log("Seeding database...");
  } catch (error: any) {
    console.error("[Seeder] Error during seeding:", error.message);
  }
};
