import { Router } from "express";
import {
  getSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary,
  downloadSalarySlipPDF,
  sendSalarySlipEmailDirectly,
} from "@/controllers/salary.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

// Protect all salary routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Salaries
 *   description: Employee salary revision ledger, compensation history & PDF payslip management
 */

/**
 * @swagger
 * /api/salaries:
 *   get:
 *     summary: Retrieve salaries with multi-faceted filtering, employee search, sorting & pagination
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by specific Employee ObjectId or comma-separated list
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by Department ObjectId or comma-separated list
 *       - in: query
 *         name: currencyId
 *         schema:
 *           type: string
 *         description: Filter by Currency ObjectId or comma-separated list
 *       - in: query
 *         name: currencyCode
 *         schema:
 *           type: string
 *         description: Filter by currency codes (e.g., USD,EUR,INR)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across employee name, email, employee code, or salary remarks
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *         description: Minimum pay salary
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *         description: Maximum pay salary
 *       - in: query
 *         name: effectiveDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Effective date start range (YYYY-MM-DD)
 *       - in: query
 *         name: effectiveDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Effective date end range (YYYY-MM-DD)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [effectiveDate, paySalary, baseSalary, createdAt]
 *           default: effectiveDate
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page (max 100)
 *     responses:
 *       200:
 *         description: Salaries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getSalaries);

/**
 * @swagger
 * /api/salaries/{id}:
 *   get:
 *     summary: Get single salary revision record by ID
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary ObjectId
 *     responses:
 *       200:
 *         description: Salary record retrieved successfully
 *       404:
 *         description: Salary record not found
 */
router.get("/:id", getSalaryById);

/**
 * @swagger
 * /api/salaries:
 *   post:
 *     summary: Create new salary revision record for an employee
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSalaryInput'
 *     responses:
 *       201:
 *         description: Salary record created successfully
 *       400:
 *         description: Missing fields or duplicate effectiveDate for employee
 *       404:
 *         description: Employee not found in your organization
 */
router.post("/", createSalary);

/**
 * @swagger
 * /api/salaries/{id}:
 *   put:
 *     summary: Update existing salary revision record
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSalaryInput'
 *     responses:
 *       200:
 *         description: Salary record updated successfully
 *       400:
 *         description: Invalid input or date conflict
 *       404:
 *         description: Salary record not found
 */
router.put("/:id", updateSalary);

/**
 * @swagger
 * /api/salaries/{id}:
 *   delete:
 *     summary: Delete salary revision record
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary ObjectId
 *     responses:
 *       200:
 *         description: Salary record deleted successfully
 *       404:
 *         description: Salary record not found
 */
router.delete("/:id", deleteSalary);

/**
 * @swagger
 * /api/salaries/{id}/pdf:
 *   get:
 *     summary: View or download official Salary Slip PDF directly
 *     description: Generates and streams an official payslip PDF with organization header, employee details, and compensation breakdown.
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary ObjectId
 *     responses:
 *       200:
 *         description: Official PDF salary slip binary stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Salary record not found
 */
router.get("/:id/pdf", downloadSalarySlipPDF);

/**
 * @swagger
 * /api/salaries/{id}/send-email:
 *   post:
 *     summary: Directly dispatch this salary slip PDF to employee email (no payload required)
 *     description: Compiles the official Salary Slip PDF for this specific salary record and emails it directly to the employee. No payload body is needed.
 *     tags: [Salaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Salary ObjectId
 *     responses:
 *       200:
 *         description: Salary slip email dispatched successfully
 *       404:
 *         description: Salary record not found
 */
router.post("/:id/send-email", sendSalarySlipEmailDirectly);

export default router;
