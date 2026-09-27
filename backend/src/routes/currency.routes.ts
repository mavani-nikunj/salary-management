import { Router } from "express";
import {
  getCurrencies,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "../controllers/currency.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Protect all currency routes with JWT authentication
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Currencies
 *   description: Global currencies directory, live exchange rates & country mappings
 */

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     summary: Retrieve currencies list with exchange rates and country details
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by 3-letter currency code or currency name
 *       - in: query
 *         name: countryId
 *         schema:
 *           type: string
 *         description: Filter by Country ObjectId
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return all currencies without pagination limit
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
 *         description: Currencies retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getCurrencies);

/**
 * @swagger
 * /api/currencies/{id}:
 *   get:
 *     summary: Get single currency by ObjectId or 3-letter code (e.g. USD, EUR, INR)
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Currency ObjectId or 3-letter currency code (case-insensitive)
 *     responses:
 *       200:
 *         description: Currency details retrieved successfully
 *       404:
 *         description: Currency not found
 */
router.get("/:id", getCurrencyById);

/**
 * @swagger
 * /api/currencies:
 *   post:
 *     summary: Create new currency record with exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCurrencyInput'
 *     responses:
 *       201:
 *         description: Currency created successfully
 *       400:
 *         description: Missing fields or duplicate currency for country
 */
router.post("/", createCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   put:
 *     summary: Update currency details or exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Currency ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               name:
 *                 type: "string"
 *                 example: "US Dollar"
 *               exRate:
 *                 type: "number"
 *                 example: 0.012
 *               countryId:
 *                 type: "string"
 *                 example: "64e0a1f8b1c2d3e4f5a6b7d1"
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *       404:
 *         description: Currency not found
 */
router.put("/:id", updateCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   delete:
 *     summary: Delete currency (verifies no active employee or salary references)
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Currency ObjectId
 *     responses:
 *       200:
 *         description: Currency deleted successfully
 *       400:
 *         description: Cannot delete referenced currency
 *       404:
 *         description: Currency not found
 */
router.delete("/:id", deleteCurrency);

export default router;
