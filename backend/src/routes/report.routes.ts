import { Router } from "express";
import {
  getOverviewReport,
  getDepartmentCompensationReport,
  getPayrollTrendReport,
  exportPayrollExcel,
  exportPayrollCsv,
} from "../controllers/report.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Protect all report routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Executive compensation analytics, department breakdown, historical payroll trends & Excel/CSV export
 */

/**
 * @swagger
 * /api/reports/overview:
 *   get:
 *     summary: Retrieve executive compensation overview and multi-dimensional breakdown report
 *     description: Returns organization headcount, nominal payroll metrics, currency-converted INR/USD payroll totals, department breakdowns, level distributions, and currency breakdowns.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollOverviewReport'
 *       401:
 *         description: Unauthorized
 */
router.get("/overview", getOverviewReport);

/**
 * @swagger
 * /api/reports/departments:
 *   get:
 *     summary: Retrieve department-level compensation analytics and headcount breakdown
 *     description: Aggregates compensation statistics per department including active headcount, total payroll, average salary, and distribution across job levels.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Department compensation report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepartmentCompensationReport'
 *       401:
 *         description: Unauthorized
 */
router.get("/departments", getDepartmentCompensationReport);

/**
 * @swagger
 * /api/reports/payroll-history:
 *   get:
 *     summary: Retrieve monthly payroll and salary revision trend report
 *     description: Aggregates historical salary disbursement totals and revision counts grouped by year and month.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of preceding months to include (max 60)
 *     responses:
 *       200:
 *         description: Payroll trend report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PayrollTrendReport'
 *       401:
 *         description: Unauthorized
 */
router.get("/payroll-history", getPayrollTrendReport);

/**
 * @swagger
 * /api/reports/export/excel:
 *   get:
 *     summary: Export multi-sheet organization payroll report to Excel (.xlsx)
 *     description: Generates a multi-sheet spreadsheet containing the Employee Payroll Register, Department Analytics, and Country Distribution with live currency conversions.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by Department ObjectId or comma-separated list
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         description: Filter by Country ObjectId or comma-separated list
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, All]
 *           default: Active
 *         description: Filter by employment status
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior, lead, manager]
 *         description: Filter by job level
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *         description: Minimum salary
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *         description: Maximum salary
 *     responses:
 *       200:
 *         description: Excel spreadsheet file download (.xlsx)
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 */
router.get("/export/excel", exportPayrollExcel);

/**
 * @swagger
 * /api/reports/export/csv:
 *   get:
 *     summary: Export employee payroll register directly to CSV (.csv)
 *     description: Generates a lightweight CSV export of the organization's employee payroll ledger.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download (.csv)
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/export/csv", exportPayrollCsv);

export default router;
