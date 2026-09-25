import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Employee, Salary, Department, Country, Currency, Organization } from "@/models";
import { sendResponse } from "@/utils/response";
import { sendEmail } from "@/utils/mailer";
import { generateSalarySlipPDF } from "@/utils/pdf";
import { AuthRequest } from "@/middlewares/auth.middleware";

/**
 * @desc   Get employees with multi-faceted filtering, search, sorting & pagination
 * @route  GET /api/employees
 * @access Private
 */
export const getEmployees = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const {
      search,
      departmentId,
      department,
      countryId,
      countryCode,
      currencyId,
      currencyCode,
      role,
      level,
      employmentType,
      status,
      minSalary,
      maxSalary,
      hireDateFrom,
      hireDateTo,
      leaveDateFrom,
      leaveDateTo,
      hasLeft,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "20",
    } = req.query;

    const query: any = { orgId: new mongoose.Types.ObjectId(orgId) };

    // 1. Text Search (across firstName, lastName, email, employeeCode, jobTitle)
    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      const regex = new RegExp(term, "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeCode: regex },
        { jobTitle: regex },
      ];
    }

    // 2. Department Filters
    if (departmentId) {
      const raw = Array.isArray(departmentId) ? departmentId : String(departmentId).split(",");
      const validIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (validIds.length > 0) {
        query.departmentId = { $in: validIds };
      }
    } else if (department && typeof department === "string") {
      const depts = await Department.find({
        orgId,
        name: new RegExp(department.trim(), "i"),
      });
      if (depts.length > 0) {
        query.departmentId = { $in: depts.map((d) => d._id) };
      } else {
        query.departmentId = new mongoose.Types.ObjectId(); // No match
      }
    }

    // 3. Country Filters
    if (countryId) {
      const raw = Array.isArray(countryId) ? countryId : String(countryId).split(",");
      const validIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (validIds.length > 0) {
        query.countryId = { $in: validIds };
      }
    } else if (countryCode && typeof countryCode === "string") {
      const codes = countryCode.split(",").map((c) => c.trim().toUpperCase());
      const countries = await Country.find({ code: { $in: codes } });
      if (countries.length > 0) {
        query.countryId = { $in: countries.map((c) => c._id) };
      } else {
        query.countryId = new mongoose.Types.ObjectId();
      }
    }

    // 4. Currency Filters
    if (currencyId) {
      const raw = Array.isArray(currencyId) ? currencyId : String(currencyId).split(",");
      const validIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (validIds.length > 0) {
        query.currencyId = { $in: validIds };
      }
    } else if (currencyCode && typeof currencyCode === "string") {
      const codes = currencyCode.split(",").map((c) => c.trim().toUpperCase());
      const currencies = await Currency.find({ code: { $in: codes } });
      if (currencies.length > 0) {
        query.currencyId = { $in: currencies.map((c) => c._id) };
      } else {
        query.currencyId = new mongoose.Types.ObjectId();
      }
    }

    // 5. Role Filter
    if (role && typeof role === "string") {
      const roles = role.split(",").map((r) => r.trim());
      query.role = { $in: roles };
    }

    // 6. Level Filter
    if (level && typeof level === "string") {
      const levels = level.split(",").map((l) => l.trim().toLowerCase());
      query.level = { $in: levels };
    }

    // 7. Employment Type Filter
    if (employmentType && typeof employmentType === "string") {
      const types = employmentType.split(",").map((t) => t.trim());
      query.employmentType = { $in: types };
    }

    // 8. Status Filter
    if (status && typeof status === "string" && status !== "All") {
      query.status = status.trim();
    }

    // 9. Salary Range Filter
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) {
        query.salary.$gte = Number(minSalary);
      }
      if (maxSalary) {
        query.salary.$lte = Number(maxSalary);
      }
    }

    // 10. Hire Date Range Filter
    if (hireDateFrom || hireDateTo) {
      query.hireDate = {};
      if (hireDateFrom) {
        query.hireDate.$gte = new Date(String(hireDateFrom));
      }
      if (hireDateTo) {
        query.hireDate.$lte = new Date(String(hireDateTo));
      }
    }

    // 11. Leave Date Filter
    if (leaveDateFrom || leaveDateTo) {
      query.leaveDate = {};
      if (leaveDateFrom) {
        query.leaveDate.$gte = new Date(String(leaveDateFrom));
      }
      if (leaveDateTo) {
        query.leaveDate.$lte = new Date(String(leaveDateTo));
      }
    } else if (hasLeft !== undefined) {
      if (String(hasLeft) === "true") {
        query.leaveDate = { $ne: null };
      } else if (String(hasLeft) === "false") {
        query.leaveDate = null;
      }
    }

    // Pagination & Sorting Setup
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const validSortFields: Record<string, string> = {
      createdAt: "createdAt",
      salary: "salary",
      hireDate: "hireDate",
      firstName: "firstName",
      lastName: "lastName",
      employeeCode: "employeeCode",
      jobTitle: "jobTitle",
      level: "level",
    };

    const sortField = validSortFields[String(sortBy)] || "createdAt";
    const orderDirection = sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortField]: orderDirection };

    // Execute queries in parallel
    const [employees, total] = await Promise.all([
      Employee.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("departmentId", "name status")
        .populate("countryId", "name code")
        .populate("currencyId", "code name exRate")
        .select("-passwordHash -resetPasswordToken -resetPasswordExpires")
        .lean(),
      Employee.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, "Employees retrieved successfully.", {
      employees,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("[Employee] Get employees error:", error);
    sendResponse(res, 500, "Failed to retrieve employees.");
  }
};

/**
 * @desc   Get single employee by ID with full salary revision timeline
 * @route  GET /api/employees/:id
 * @access Private
 */
export const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid employee ID format.");
      return;
    }

    const employee = await Employee.findOne({
      _id: id,
      orgId,
    })
      .populate("departmentId", "name status")
      .populate("countryId", "name code")
      .populate("currencyId", "code name exRate")
      .select("-passwordHash -resetPasswordToken -resetPasswordExpires");

    if (!employee) {
      sendResponse(res, 404, "Employee not found in your organization.");
      return;
    }

    // Salary History Pagination
    const salaryPageNum = Math.max(
      1,
      parseInt(String(req.query.salaryPage || req.query.page || 1), 10) || 1,
    );
    const salaryLimitNum = Math.min(
      100,
      Math.max(
        1,
        parseInt(String(req.query.salaryLimit || req.query.limit || 10), 10) || 10,
      ),
    );
    const salarySkip = (salaryPageNum - 1) * salaryLimitNum;

    // Fetch salary revision ledger with pagination
    const [salaryHistory, totalSalaryRecords] = await Promise.all([
      Salary.find({ employeeId: employee._id })
        .sort({ effectiveDate: -1, createdAt: -1 })
        .skip(salarySkip)
        .limit(salaryLimitNum)
        .populate("currencyId", "code name exRate"),
      Salary.countDocuments({ employeeId: employee._id }),
    ]);

    const totalSalaryPages = Math.ceil(totalSalaryRecords / salaryLimitNum);

    sendResponse(res, 200, "Employee retrieved successfully.", {
      employee,
      salaryHistory: {
        records: salaryHistory,
        pagination: {
          total: totalSalaryRecords,
          page: salaryPageNum,
          limit: salaryLimitNum,
          totalPages: totalSalaryPages,
          hasNextPage: salaryPageNum < totalSalaryPages,
          hasPrevPage: salaryPageNum > 1,
        },
      },
      salaryRecords: salaryHistory,
      salaryPagination: {
        total: totalSalaryRecords,
        page: salaryPageNum,
        limit: salaryLimitNum,
        totalPages: totalSalaryPages,
        hasNextPage: salaryPageNum < totalSalaryPages,
        hasPrevPage: salaryPageNum > 1,
      },
    });
  } catch (error: any) {
    console.error("[Employee] Get employee by ID error:", error);
    sendResponse(res, 500, "Failed to retrieve employee.");
  }
};

/**
 * @desc   Create new employee & initial salary entry, optionally send welcome email
 * @route  POST /api/employees
 * @access Private
 */
export const createEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
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
      role = "Employee",
      level = "mid",
      countryId,
      currencyId,
      salary,
      hireDate,
      employmentType = "Full-time",
      sendWelcomeEmail = true,
    } = req.body;

    // Validate required fields
    if (
      !employeeCode ||
      !firstName ||
      !lastName ||
      !email ||
      !jobTitle ||
      !departmentId ||
      !countryId ||
      !currencyId ||
      salary === undefined ||
      !hireDate
    ) {
      sendResponse(
        res,
        400,
        "Missing required fields: employeeCode, firstName, lastName, email, jobTitle, departmentId, countryId, currencyId, salary, hireDate.",
      );
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = employeeCode.trim();

    // Check duplicate email
    const existingEmail = await Employee.findOne({ email: normalizedEmail });
    if (existingEmail) {
      sendResponse(
        res,
        400,
        `Employee with email '${normalizedEmail}' already exists.`,
      );
      return;
    }

    // Check duplicate employeeCode in organization
    const existingCode = await Employee.findOne({
      orgId,
      employeeCode: cleanCode,
    });
    if (existingCode) {
      sendResponse(
        res,
        400,
        `Employee code '${cleanCode}' is already registered in this organization.`,
      );
      return;
    }

    // Optional password hashing
    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const newEmployee = await Employee.create({
      employeeCode: cleanCode,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      jobTitle: jobTitle.trim(),
      departmentId,
      role,
      level: level.toLowerCase(),
      countryId,
      currencyId,
      salary: Number(salary),
      hireDate: new Date(hireDate),
      employmentType,
      status: "Active",
      orgId,
      passwordHash,
    });

    // Create initial Salary ledger record
    await Salary.create({
      employeeId: newEmployee._id,
      baseSalary: Number(salary),
      paySalary: Number(salary),
      currencyId,
      effectiveDate: newEmployee.hireDate,
      remark: "Initial employment salary record",
    });

    // Send welcome onboarding email
    if (sendWelcomeEmail) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3022";
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to the Team, ${firstName}!</h2>
          <p>We are delighted to welcome you to our organization as <strong>${jobTitle}</strong>.</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Employee Code:</strong> ${cleanCode}</p>
            <p style="margin: 4px 0;"><strong>Official Email:</strong> ${normalizedEmail}</p>
            <p style="margin: 4px 0;"><strong>Start Date:</strong> ${new Date(hireDate).toLocaleDateString()}</p>
            <p style="margin: 4px 0;"><strong>Role:</strong> ${role}</p>
          </div>
          <p>You can access your employee portal here: <a href="${clientUrl}" style="color: #2563eb;">${clientUrl}</a></p>
          <p style="color: #64748b; font-size: 13px;">If you have any questions, please contact your HR department.</p>
        </div>
      `;

      sendEmail({
        to: normalizedEmail,
        subject: `Welcome to the Team - Your Employee Profile (${cleanCode})`,
        text: `Welcome ${firstName}! You have been registered as ${jobTitle}. Employee Code: ${cleanCode}.`,
        html: welcomeHtml,
      }).catch((mailErr) => {
        console.warn(
          `[Employee] Welcome email dispatch failed for ${normalizedEmail}: ${mailErr.message}`,
        );
      });
    }

    sendResponse(res, 201, "Employee created successfully.", {
      employee: newEmployee,
    });
  } catch (error: any) {
    console.error("[Employee] Create employee error:", error);
    sendResponse(res, 500, "Failed to create employee.");
  }
};

/**
 * @desc   Update employee details, handles salary increments & status changes
 * @route  PUT /api/employees/:id
 * @access Private
 */
export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid employee ID format.");
      return;
    }

    const employee = await Employee.findOne({ _id: id, orgId });
    if (!employee) {
      sendResponse(res, 404, "Employee not found in your organization.");
      return;
    }

    const {
      firstName,
      lastName,
      jobTitle,
      departmentId,
      role,
      level,
      countryId,
      currencyId,
      salary,
      salaryRemark,
      salaryEffectiveDate,
      employmentType,
      status,
      leaveDate,
    } = req.body;

    if (firstName) employee.firstName = firstName.trim();
    if (lastName) employee.lastName = lastName.trim();
    if (jobTitle) employee.jobTitle = jobTitle.trim();
    if (departmentId) employee.departmentId = departmentId;
    if (role) employee.role = role;
    if (level) employee.level = level.toLowerCase();
    if (countryId) employee.countryId = countryId;
    if (currencyId) employee.currencyId = currencyId;
    if (employmentType) employee.employmentType = employmentType;

    // Handle status & leaveDate
    if (status) {
      employee.status = status;
      if (status === "Inactive" && !employee.leaveDate) {
        employee.leaveDate = leaveDate ? new Date(leaveDate) : new Date();
      } else if (status === "Active") {
        employee.leaveDate = undefined;
      }
    }

    // Handle Salary Update and create a historical Salary entry
    const newSalary = Number(salary);
    if (!isNaN(newSalary) && newSalary > 0 && newSalary !== employee.salary) {
      const effectiveDate = salaryEffectiveDate
        ? new Date(salaryEffectiveDate)
        : new Date();

      employee.salary = newSalary;

      await Salary.create({
        employeeId: employee._id,
        baseSalary: newSalary,
        paySalary: newSalary,
        currencyId: currencyId || employee.currencyId,
        effectiveDate,
        remark: salaryRemark || `Salary revision to ${newSalary}`,
      });
    }

    await employee.save();

    sendResponse(res, 200, "Employee updated successfully.", {
      employee,
    });
  } catch (error: any) {
    console.error("[Employee] Update employee error:", error);
    sendResponse(res, 500, "Failed to update employee.");
  }
};

/**
 * @desc   Soft deactivate or permanently delete an employee
 * @route  DELETE /api/employees/:id
 * @access Private
 */
export const deleteEmployee = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { permanent } = req.query;
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid employee ID format.");
      return;
    }

    const employee = await Employee.findOne({ _id: id, orgId });
    if (!employee) {
      sendResponse(res, 404, "Employee not found in your organization.");
      return;
    }

    if (permanent === "true") {
      // Hard delete employee and salary records
      await Promise.all([
        Employee.deleteOne({ _id: id }),
        Salary.deleteMany({ employeeId: id }),
      ]);
      sendResponse(
        res,
        200,
        "Employee and associated records permanently deleted.",
      );
      return;
    }

    // Soft delete / deactivation
    employee.status = "Inactive";
    employee.leaveDate = new Date();
    await employee.save();

    sendResponse(
      res,
      200,
      "Employee deactivated successfully (marked Inactive).",
      { employee },
    );
  } catch (error: any) {
    console.error("[Employee] Delete employee error:", error);
    sendResponse(res, 500, "Failed to delete employee.");
  }
};

/**
 * @desc   Send custom notification or salary slip PDF email to an employee
 * @route  POST /api/employees/:id/send-email
 * @access Private
 */
export const sendEmployeeEmail = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid employee ID format.");
      return;
    }

    const employee = await Employee.findOne({ _id: id, orgId })
      .populate("departmentId", "name")
      .populate("countryId", "name code")
      .populate("currencyId", "code name exRate");

    if (!employee) {
      sendResponse(res, 404, "Employee not found in your organization.");
      return;
    }

    const targetSalaryId = req.body?.salaryId || req.query?.salaryId;
    const subject = req.body?.subject;
    const message = req.body?.message;
    const html = req.body?.html;

    let attachments: Array<{ filename: string; content: Buffer; contentType?: string }> | undefined;
    let selectedSalary: any = null;

    // 1. If salaryId is provided, find that specific salary record
    if (targetSalaryId) {
      if (!mongoose.Types.ObjectId.isValid(String(targetSalaryId))) {
        sendResponse(res, 400, "Invalid salaryId format.");
        return;
      }

      selectedSalary = await Salary.findOne({
        _id: targetSalaryId,
        employeeId: employee._id,
      }).populate("currencyId", "code name exRate");

      if (!selectedSalary) {
        sendResponse(res, 404, "Selected salary record not found for this employee.");
        return;
      }
    } else {
      // 2. Otherwise auto-select the latest salary slip for this employee
      selectedSalary = await Salary.findOne({
        employeeId: employee._id,
      })
        .sort({ effectiveDate: -1, createdAt: -1 })
        .populate("currencyId", "code name exRate");
    }

    // 3. If a salary record exists (either selected or latest), generate PDF attachment
    if (selectedSalary) {
      const organization = await Organization.findById(orgId);
      const currencyObj: any = selectedSalary.currencyId;
      const departmentObj: any = employee.departmentId;
      const countryObj: any = employee.countryId;

      const pdfBuffer = await generateSalarySlipPDF({
        organizationName: organization?.name || "Salary Management",
        organizationEmail: organization?.email,
        employeeCode: employee.employeeCode,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        jobTitle: employee.jobTitle,
        departmentName: departmentObj?.name,
        countryName: countryObj?.name,
        employmentType: employee.employmentType,
        baseSalary: selectedSalary.baseSalary,
        paySalary: selectedSalary.paySalary,
        currencyCode: currencyObj?.code || "USD",
        currencyName: currencyObj?.name,
        exchangeRate: currencyObj?.exRate,
        effectiveDate: selectedSalary.effectiveDate,
        remark: selectedSalary.remark,
        salaryId: String(selectedSalary._id),
      });

      const effectiveDateStr = new Date(selectedSalary.effectiveDate).toISOString().slice(0, 7);
      const safeFilename = `SalarySlip_${employee.employeeCode}_${effectiveDateStr}.pdf`;

      attachments = [
        {
          filename: safeFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    // Determine Subject
    const emailSubject =
      subject ||
      (selectedSalary
        ? `Official Salary Slip - ${employee.employeeCode} (${new Date(selectedSalary.effectiveDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })})`
        : `Notification - ${employee.employeeCode}`);

    // Determine Email Body
    let textContent = message;
    let htmlContent = html;

    if (selectedSalary) {
      const curCode = selectedSalary.currencyId?.code || "USD";
      const formattedSalary = Number(selectedSalary.paySalary).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const effectiveDateFormatted = new Date(selectedSalary.effectiveDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!htmlContent) {
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background-color: #1e293b; padding: 18px 20px; border-radius: 6px; margin-bottom: 22px;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Official Salary Slip</h2>
              <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Remuneration Statement & Payslip Notification</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.5;">Dear <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.5; color: #334155;">
              Your official salary slip for the pay period ending <strong>${effectiveDateFormatted}</strong> has been generated and is attached to this email as a PDF document.
            </p>
            
            ${
              message
                ? `<div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 16px; margin: 18px 0; border-radius: 4px; font-size: 14px; color: #1e293b;">
                     <strong>Message from HR:</strong><br/>${message.replace(/\n/g, "<br>")}
                   </div>`
                : ""
            }

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 600; color: #64748b;">Employee Code</td>
                <td style="padding: 10px 14px; font-weight: 600; text-align: right; color: #0f172a;">${employee.employeeCode}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 600; color: #64748b;">Designation</td>
                <td style="padding: 10px 14px; text-align: right; color: #0f172a;">${employee.jobTitle}</td>
              </tr>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 14px; font-weight: 600; color: #64748b;">Effective Date</td>
                <td style="padding: 10px 14px; text-align: right; color: #0f172a;">${effectiveDateFormatted}</td>
              </tr>
              <tr style="background-color: #ecfdf5; border-bottom: 2px solid #10b981;">
                <td style="padding: 12px 14px; font-weight: bold; color: #065f46;">Net Payable Salary</td>
                <td style="padding: 12px 14px; font-weight: bold; text-align: right; color: #065f46; font-size: 16px;">${curCode} ${formattedSalary}</td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              Please review the attached PDF document for full compensation breakdowns and exchange rate details. If you have any inquiries regarding this payment, please contact HR/Payroll.
            </p>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
              This is a confidential automated email notification from the Payroll Management System.
            </div>
          </div>
        `;
      }

      if (!textContent) {
        textContent = `Dear ${employee.firstName} ${employee.lastName},\n\nYour salary slip for effective date ${effectiveDateFormatted} is attached as a PDF.\nNet Payable: ${curCode} ${formattedSalary}\nEmployee Code: ${employee.employeeCode}\n\n${message ? `Note: ${message}\n\n` : ""}Best regards,\nHR & Payroll Team`;
      }
    } else {
      if (!htmlContent) {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h3 style="color: #2563eb;">Notification from HR Management</h3>
            <p>Dear ${employee.firstName} ${employee.lastName},</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0; border-radius: 4px;">
              ${(message || "This is a notification regarding your employee profile.").replace(/\n/g, "<br>")}
            </div>
            <p style="color: #64748b; font-size: 13px;">Employee Code: ${employee.employeeCode} | Job Title: ${employee.jobTitle}</p>
          </div>
        `;
      }
      if (!textContent) {
        textContent = message || `Dear ${employee.firstName} ${employee.lastName},\n\nThis is a notification regarding your employee profile.\nEmployee Code: ${employee.employeeCode}\n\nBest regards,\nHR Team`;
      }
    }

    await sendEmail({
      to: employee.email,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
      attachments,
    });

    sendResponse(
      res,
      200,
      `Email sent successfully to ${employee.email} (${employee.employeeCode})${selectedSalary ? " with salary slip PDF attached" : ""}.`,
      {
        recipient: employee.email,
        employeeCode: employee.employeeCode,
        salarySlipAttached: !!selectedSalary,
      },
    );
  } catch (error: any) {
    console.error("[Employee] Send email error:", error);
    sendResponse(res, 500, `Failed to send email: ${error.message}`);
  }
};
