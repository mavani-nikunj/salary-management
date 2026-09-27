import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  sendEmployeeEmail,
} from "../controllers/employee.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

// All employee routes require authentication and multi-tenant scoping
router.use(protect);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: List employees with multi-faceted filtering, search, sorting & pagination
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search across firstName, lastName, email, employeeCode, or jobTitle
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter by Department ObjectId (comma-separated for multiple)
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by Department name (e.g. Engineering)
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         description: Filter by Country ObjectId
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *         description: Filter by 2-letter Country code (e.g. US, DE, GB)
 *       - in: query
 *         name: currencyId
 *         schema:
 *           type: string
 *         description: Filter by Currency ObjectId
 *       - in: query
 *         name: currencyCode
 *         schema:
 *           type: string
 *         description: Filter by Currency code (e.g. USD, EUR, INR)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [HR, Employee]
 *         description: Filter by role
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [junior, mid, senior, lead, manager]
 *         description: Filter by seniority level
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [Full-time, Part-time, Contract]
 *         description: Filter by employment type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, All]
 *         description: Filter by employment status
 *       - in: query
 *         name: minSalary
 *         schema:
 *           type: number
 *         description: Minimum salary threshold
 *       - in: query
 *         name: maxSalary
 *         schema:
 *           type: number
 *         description: Maximum salary threshold
 *       - in: query
 *         name: hireDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start of hire date range (YYYY-MM-DD)
 *       - in: query
 *         name: hireDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End of hire date range (YYYY-MM-DD)
 *       - in: query
 *         name: hasLeft
 *         schema:
 *           type: boolean
 *         description: Filter employees who have left (true) or active (false)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, salary, hireDate, firstName, lastName, employeeCode, jobTitle, level]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Employees retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/", getEmployees);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get single employee by ID with full salary revision history
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ObjectId
 *       - in: query
 *         name: salaryPage
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for salary revision history
 *       - in: query
 *         name: salaryLimit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of salary revision records per page
 *     responses:
 *       200:
 *         description: Employee retrieved successfully with paginated salary history
 *       404:
 *         description: Employee not found
 */
router.get("/:id", getEmployeeById);

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Create new employee, record initial salary, and send welcome email
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Missing fields or duplicate employeeCode/email
 */
router.post("/", createEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee details (automatically registers new salary entry if salary changed)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeInput'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 */
router.put("/:id", updateEmployee);

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     summary: Deactivate employee (soft delete) or permanently delete
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ObjectId
 *       - in: query
 *         name: permanent
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, permanently removes employee and all salary history
 *     responses:
 *       200:
 *         description: Employee deleted/deactivated successfully
 *       404:
 *         description: Employee not found
 */
router.delete("/:id", deleteEmployee);

/**
 * @swagger
 * /api/employees/{id}/send-email:
 *   post:
 *     summary: Send salary slip PDF email to employee (no payload required)
 *     description: Directly dispatches an email with the salary slip PDF attached. No payload body is required. By default, it automatically generates and attaches the employee's latest salary slip PDF. You can optionally provide salaryId via query or body to select a specific past slip.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ObjectId
 *       - in: query
 *         name: salaryId
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional specific Salary ObjectId. If omitted, the latest salary slip is automatically selected.
 *     responses:
 *       200:
 *         description: Email sent successfully with salary slip PDF attached
 *       400:
 *         description: Invalid employee or salary ID format
 *       404:
 *         description: Employee or specified salary slip not found
 */
router.post("/:id/send-email", sendEmployeeEmail);

export default router;
