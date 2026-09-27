import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import moduleAlias from "module-alias";

// Register @ alias fallback for both local and serverless environments
try {
  moduleAlias.addAliases({
    "@": path.resolve(__dirname, "../src"),
  });
} catch (e) {
  // Alias already registered or not required
}

import app from "../src/app";
import { connectDB } from "../src/config/db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (error: any) {
    console.error("[Vercel Handler] Database connection failed:", error.message);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Database connection failed",
    });
  }

  return app(req, res);
}
