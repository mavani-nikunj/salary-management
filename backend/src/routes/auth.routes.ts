import express from "express";
import {
  login,
  registerOrg,
  registerHR,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
} from "@/controllers/auth.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login Organization or HR / Employee
 *     description: Authenticates user credentials and returns a signed JWT token with user details.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account is inactive
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register-org:
 *   post:
 *     summary: Register a new Organization (Staged for future use)
 *     description: Registers a new organization. Currently disabled by default unless ALLOW_REGISTRATION=true is configured.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterOrgInput'
 *     responses:
 *       201:
 *         description: Organization registered successfully
 *       400:
 *         description: Validation error or email already in use
 *       403:
 *         description: Self-registration currently disabled
 */
router.post("/register-org", registerOrg);

/**
 * @swagger
 * /api/auth/register-hr:
 *   post:
 *     summary: Register a new HR Manager (Staged for future use)
 *     description: Registers a new HR user for an organization. Currently disabled by default unless ALLOW_REGISTRATION=true is configured.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterHRInput'
 *     responses:
 *       201:
 *         description: HR registered successfully
 *       400:
 *         description: Validation error or duplicate employee code
 *       403:
 *         description: Self-registration currently disabled
 */
router.post("/register-hr", registerHR);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link
 *     description: Generates a temporary reset token and dispatches reset instructions to the provided email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Reset instructions sent if account exists
 *       400:
 *         description: Email address missing
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Resets password for the account associated with the provided valid reset token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     description: Returns profile details and role for the token bearer.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized or token invalid
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     description: Updates password for the current user after validating their existing password.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid inputs
 *       401:
 *         description: Current password incorrect
 */
router.post("/change-password", protect, changePassword);

export default router;
