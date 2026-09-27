import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Organization, Employee, Salary } from "../models";
import { generateToken } from "../utils/jwt";
import { sendResponse } from "../utils/response";
import { sendEmail } from "../utils/mailer";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * @desc   Login Organization or HR / Employee
 * @route  POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendResponse(res, 400, "Please provide email and password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check if email belongs to an Organization
    const org = await Organization.findOne({ email: normalizedEmail });
    if (org) {
      const isMatch = await bcrypt.compare(password, org.passwordHash);
      if (!isMatch) {
        sendResponse(res, 401, "Invalid email or password.");
        return;
      }

      if (org.status === "Inactive") {
        sendResponse(
          res,
          403,
          "Your organization account is inactive. Please contact support.",
        );
        return;
      }

      const token = generateToken({
        id: org._id,
        email: org.email,
        role: "Organization",
        orgId: org._id,
      });

      sendResponse(res, 200, "Login successful.", {
        token,
        user: {
          id: org._id,
          name: org.name,
          email: org.email,
          role: "Organization",
          status: org.status,
        },
      });
      return;
    }

    // 2. Check if email belongs to an Employee (HR or standard Employee)
    const employee = await Employee.findOne({ email: normalizedEmail });
    if (employee) {
      if (!employee.passwordHash) {
        sendResponse(
          res,
          401,
          "This employee account does not have login credentials configured. Please contact HR.",
        );
        return;
      }

      const isMatch = await bcrypt.compare(password, employee.passwordHash);
      if (!isMatch) {
        sendResponse(res, 401, "Invalid email or password.");
        return;
      }

      if (employee.status === "Inactive") {
        sendResponse(
          res,
          403,
          "Your account is inactive. Please contact HR or your administrator.",
        );
        return;
      }

      const token = generateToken({
        id: employee._id,
        email: employee.email,
        role: employee.role,
        orgId: employee.orgId,
      });

      sendResponse(res, 200, "Login successful.", {
        token,
        user: {
          id: employee._id,
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          role: employee.role,
          jobTitle: employee.jobTitle,
          departmentId: employee.departmentId,
          orgId: employee.orgId,
          status: employee.status,
        },
      });
      return;
    }

    // 3. User not found
    sendResponse(res, 401, "Invalid email or password.");
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    sendResponse(res, 500, "An error occurred during login. Please try again.");
  }
};

/**
 * @desc   Register Organization (Staged for future use; currently disabled)
 * @route  POST /api/auth/register-org
 * @access Public
 */
export const registerOrg = async (req: Request, res: Response): Promise<void> => {
  try {
    // Feature flag guard: New organization registration is currently disabled
    const allowRegistration = process.env.ALLOW_REGISTRATION === "true";
    if (!allowRegistration) {
      sendResponse(
        res,
        403,
        "Organization self-registration is currently disabled. Please contact the system administrator.",
      );
      return;
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      sendResponse(res, 400, "Please provide name, email, and password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingOrg = await Organization.findOne({ email: normalizedEmail });
    if (existingOrg) {
      sendResponse(res, 400, "An organization with this email already exists.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const organization = await Organization.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      status: "Active",
    });

    const token = generateToken({
      id: organization._id,
      email: organization.email,
      role: "Organization",
      orgId: organization._id,
    });

    sendResponse(res, 201, "Organization registered successfully.", {
      token,
      organization: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        status: organization.status,
      },
    });
  } catch (error: any) {
    console.error("[Auth] Register Organization error:", error);
    sendResponse(res, 500, "Failed to register organization.");
  }
};

/**
 * @desc   Register HR user (Staged for future use; currently disabled)
 * @route  POST /api/auth/register-hr
 * @access Public
 */
export const registerHR = async (req: Request, res: Response): Promise<void> => {
  try {
    // Feature flag guard: New HR registration is currently disabled
    const allowRegistration = process.env.ALLOW_REGISTRATION === "true";
    if (!allowRegistration) {
      sendResponse(
        res,
        403,
        "HR self-registration is currently disabled. Please contact the system administrator.",
      );
      return;
    }

    const {
      employeeCode,
      firstName,
      lastName,
      email,
      password,
      jobTitle,
      departmentId,
      countryId,
      currencyId,
      salary,
      hireDate,
      employmentType,
      orgId,
    } = req.body;

    if (!email || !password || !employeeCode || !orgId || !firstName || !lastName) {
      sendResponse(
        res,
        400,
        "Missing required fields: employeeCode, firstName, lastName, email, password, orgId.",
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existingEmployee = await Employee.findOne({ email: normalizedEmail });
    if (existingEmployee) {
      sendResponse(res, 400, "An employee with this email already exists.");
      return;
    }

    // Check employeeCode uniqueness in organization
    const existingCode = await Employee.findOne({
      orgId,
      employeeCode: employeeCode.trim(),
    });
    if (existingCode) {
      sendResponse(
        res,
        400,
        `Employee code '${employeeCode}' is already registered in this organization.`,
      );
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const hr = await Employee.create({
      employeeCode: employeeCode.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      jobTitle: jobTitle?.trim() || "HR Manager",
      departmentId,
      role: "HR",
      level: "manager",
      countryId,
      currencyId,
      salary: salary || 100000,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      employmentType: employmentType || "Full-time",
      status: "Active",
      orgId,
      passwordHash,
    });

    if (currencyId && salary) {
      await Salary.create({
        employeeId: hr._id,
        baseSalary: salary,
        paySalary: salary,
        currencyId,
        effectiveDate: hr.hireDate,
        remark: "Initial HR registration salary record",
      });
    }

    const token = generateToken({
      id: hr._id,
      email: hr.email,
      role: "HR",
      orgId: hr.orgId,
    });

    sendResponse(res, 201, "HR registered successfully.", {
      token,
      user: {
        id: hr._id,
        employeeCode: hr.employeeCode,
        firstName: hr.firstName,
        lastName: hr.lastName,
        email: hr.email,
        role: hr.role,
        jobTitle: hr.jobTitle,
        orgId: hr.orgId,
      },
    });
  } catch (error: any) {
    console.error("[Auth] Register HR error:", error);
    sendResponse(res, 500, "Failed to register HR user.");
  }
};

/**
 * @desc   Request password reset token via email
 * @route  POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      sendResponse(res, 400, "Please provide a valid email address.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find in Organization or Employee
    let user: any = await Organization.findOne({ email: normalizedEmail });
    if (!user) {
      user = await Employee.findOne({ email: normalizedEmail });
    }

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      sendResponse(
        res,
        200,
        "If that email address is registered, password reset instructions have been sent.",
      );
      return;
    }

    // Generate random 32-byte hex token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    // Prepare reset email
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3022";
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for the Salary Management portal.</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or use this token directly: <code>${resetToken}</code></p>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #64748b; font-size: 14px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Salary Management",
        text: `To reset your password, visit: ${resetLink} or use token: ${resetToken}`,
        html: htmlContent,
      });
    } catch (mailError: any) {
      console.warn(
        `[Auth] SMTP delivery failed (${mailError.message}). Reset token for development: ${resetToken}`,
      );
    }

    const isDev = process.env.NODE_ENV !== "production";
    sendResponse(
      res,
      200,
      "If that email address is registered, password reset instructions have been sent.",
      isDev ? { resetToken } : undefined,
    );
  } catch (error: any) {
    console.error("[Auth] Forgot password error:", error);
    sendResponse(res, 500, "Failed to process forgot password request.");
  }
};

/**
 * @desc   Reset password using token
 * @route  POST /api/auth/reset-password
 * @access Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      sendResponse(res, 400, "Please provide the reset token and new password.");
      return;
    }

    if (newPassword.length < 6) {
      sendResponse(
        res,
        400,
        "New password must be at least 6 characters long.",
      );
      return;
    }

    // Find user with valid and unexpired token
    let user: any = await Organization.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      user = await Employee.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
    }

    if (!user) {
      sendResponse(
        res,
        400,
        "Password reset token is invalid or has expired.",
      );
      return;
    }

    // Hash new password and clear token fields
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendResponse(
      res,
      200,
      "Password has been reset successfully. Please log in with your new password.",
    );
  } catch (error: any) {
    console.error("[Auth] Reset password error:", error);
    sendResponse(res, 500, "Failed to reset password.");
  }
};

/**
 * @desc   Get current authenticated user profile
 * @route  GET /api/auth/me
 * @access Private
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      sendResponse(res, 401, "Not authorized.");
      return;
    }

    sendResponse(res, 200, "User profile retrieved successfully.", {
      user: req.user,
      role: req.userRole,
      orgId: req.orgId,
    });
  } catch (error: any) {
    console.error("[Auth] Get profile error:", error);
    sendResponse(res, 500, "Failed to fetch user profile.");
  }
};

/**
 * @desc   Change password for authenticated user
 * @route  POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      sendResponse(
        res,
        400,
        "Please provide both current password and new password.",
      );
      return;
    }

    if (newPassword.length < 6) {
      sendResponse(
        res,
        400,
        "New password must be at least 6 characters long.",
      );
      return;
    }

    // Fetch user with passwordHash
    let user: any;
    if (req.userRole === "Organization") {
      user = await Organization.findById(req.user._id);
    } else {
      user = await Employee.findById(req.user._id);
    }

    if (!user || !user.passwordHash) {
      sendResponse(res, 404, "User not found or password not set.");
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      sendResponse(res, 401, "Current password is incorrect.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    sendResponse(res, 200, "Password updated successfully.");
  } catch (error: any) {
    console.error("[Auth] Change password error:", error);
    sendResponse(res, 500, "Failed to change password.");
  }
};
