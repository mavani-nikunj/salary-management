"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const seedDatabase = async () => {
    try {
        console.log("Seeding database...");
    }
    catch (error) {
        console.error("[Seeder] Error during seeding:", error.message);
    }
};
exports.seedDatabase = seedDatabase;
