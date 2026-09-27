import { Router } from "express";
import {
  getDashboardSummary,
  getDashboardMetrics,
} from "../controllers/dashboard.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Protect all dashboard routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Consolidated executive dashboard KPIs, distribution charts & recent activity feeds
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Retrieve consolidated dashboard summary
 *     description: Returns executive KPIs (headcount, payroll, averages, 30-day changes), chart analytics (trends, department, level, employment type, country distribution), and live recent activity feeds (latest hires, recent revisions).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummary'
 *       401:
 *         description: Unauthorized
 */
router.get("/", getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Retrieve lightweight dashboard KPIs
 *     description: Quick endpoint returning headline numbers (headcount, active count, total departments, monthly payroll, average salary).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/metrics", getDashboardMetrics);

export default router;
