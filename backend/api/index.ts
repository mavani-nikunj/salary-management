import type { VercelRequest, VercelResponse } from "@vercel/node";
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
