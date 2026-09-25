import { Router } from "express";
import {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
} from "@/controllers/country.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

// Protect all country routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Countries
 *   description: Global countries directory and master lookup table
 */

/**
 * @swagger
 * /api/countries:
 *   get:
 *     summary: Retrieve list of countries with search and sorting
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by country name or 2-letter ISO code
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return all countries without pagination limit
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
 *           default: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getCountries);

/**
 * @swagger
 * /api/countries/{id}:
 *   get:
 *     summary: Get single country by ObjectId or 2-letter ISO code (e.g. US, IN, GB)
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ObjectId or 2-letter ISO code (case-insensitive)
 *     responses:
 *       200:
 *         description: Country details retrieved successfully
 *       404:
 *         description: Country not found
 */
router.get("/:id", getCountryById);

/**
 * @swagger
 * /api/countries:
 *   post:
 *     summary: Create new country entry
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCountryInput'
 *     responses:
 *       201:
 *         description: Country created successfully
 *       400:
 *         description: Missing fields or duplicate country code
 */
router.post("/", createCountry);

/**
 * @swagger
 * /api/countries/{id}:
 *   put:
 *     summary: Update country details
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               name:
 *                 type: "string"
 *                 example: "United States"
 *               code:
 *                 type: "string"
 *                 example: "US"
 *     responses:
 *       200:
 *         description: Country updated successfully
 *       400:
 *         description: Duplicate code or invalid ID
 *       404:
 *         description: Country not found
 */
router.put("/:id", updateCountry);

/**
 * @swagger
 * /api/countries/{id}:
 *   delete:
 *     summary: Delete country (verifies no active dependencies)
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ObjectId
 *     responses:
 *       200:
 *         description: Country deleted successfully
 *       400:
 *         description: Cannot delete referenced country
 *       404:
 *         description: Country not found
 */
router.delete("/:id", deleteCountry);

export default router;
