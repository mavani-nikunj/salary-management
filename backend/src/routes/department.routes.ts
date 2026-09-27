import { Router } from "express";
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Protect all department routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Organization departments management, team structure & headcount
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Retrieve organization departments with employee headcount and search
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search department name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, All]
 *           default: Active
 *         description: Filter by status
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, returns all departments without pagination limit
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
 *           default: 50
 *         description: Number of departments per page
 *     responses:
 *       200:
 *         description: Departments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getDepartments);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Get single department by ID with active employee statistics
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ObjectId
 *     responses:
 *       200:
 *         description: Department details retrieved successfully
 *       404:
 *         description: Department not found
 */
router.get("/:id", getDepartmentById);

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create new department in the organization
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentInput'
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Missing name or duplicate department name
 */
router.post("/", createDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department details (name, status)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               name:
 *                 type: "string"
 *                 example: "Software Architecture"
 *               status:
 *                 type: "string"
 *                 enum: ["Active", "Inactive"]
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       400:
 *         description: Duplicate name or invalid ID
 *       404:
 *         description: Department not found
 */
router.put("/:id", updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete department (checks for assigned employees)
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ObjectId
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, proceeds with deletion even if employees are currently assigned
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Cannot delete department with assigned employees without force=true
 *       404:
 *         description: Department not found
 */
router.delete("/:id", deleteDepartment);

export default router;
