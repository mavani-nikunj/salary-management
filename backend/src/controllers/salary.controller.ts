import { Response } from "express";
import mongoose from "mongoose";
import { Salary, Employee, Currency, Organization, Department } from "@/models";
import { sendResponse } from "@/utils/response";
import { sendEmail } from "@/utils/mailer";
import { generateSalarySlipPDF } from "@/utils/pdf";
import { AuthRequest } from "@/middlewares/auth.middleware";

/**
 * @desc   Get salaries with multi-faceted search, filter, sort & pagination
 * @route  GET /api/salaries
 * @access Private
 */
export const getSalaries = async (
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
      employeeId,
      departmentId,
      currencyId,
      currencyCode,
      search,
      minSalary,
      maxSalary,
      effectiveDateFrom,
      effectiveDateTo,
      startDate,
      endDate,
      sortBy = "effectiveDate",
      sortOrder = "desc",
      page = "1",
      limit = "20",
    } = req.query;

    // 1. Build Employee Scope Filter (Salaries must belong to employees within this org)
    const employeeQuery: any = { orgId: new mongoose.Types.ObjectId(orgId) };

    if (employeeId) {
      const raw = Array.isArray(employeeId) ? employeeId : String(employeeId).split(",");
      const validEmpIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validEmpIds.length > 0) {
        employeeQuery._id = { $in: validEmpIds };
      }
    }

    if (departmentId) {
      const raw = Array.isArray(departmentId) ? departmentId : String(departmentId).split(",");
      const validDeptIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validDeptIds.length > 0) {
        employeeQuery.departmentId = { $in: validDeptIds };
      }
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const term = search.trim();
      const regex = new RegExp(term, "i");
      employeeQuery.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeCode: regex },
        { jobTitle: regex },
      ];
    }

    // Retrieve matching employee IDs for this organization
    const matchingEmployees = await Employee.find(employeeQuery).select("_id").lean();
    const matchingEmpIds = matchingEmployees.map((e) => e._id);

    if (matchingEmpIds.length === 0) {
      sendResponse(res, 200, "Salaries retrieved successfully.", {
        salaries: [],
        pagination: {
          total: 0,
          page: Number(page) || 1,
          limit: Number(limit) || 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
      return;
    }

    // 2. Build Salary Query
    const salaryQuery: any = { employeeId: { $in: matchingEmpIds } };

    // Currency filter
    if (currencyId) {
      const raw = Array.isArray(currencyId) ? currencyId : String(currencyId).split(",");
      const validCurrIds = raw
        .map((id) => String(id).trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validCurrIds.length > 0) {
        salaryQuery.currencyId = { $in: validCurrIds };
      }
    } else if (currencyCode && typeof currencyCode === "string") {
      const codes = currencyCode.split(",").map((c) => c.trim().toUpperCase());
      const currencies = await Currency.find({ code: { $in: codes } });
      if (currencies.length > 0) {
        salaryQuery.currencyId = { $in: currencies.map((c) => c._id) };
      } else {
        salaryQuery.currencyId = new mongoose.Types.ObjectId();
      }
    }

    // Salary range filter (on paySalary)
    if (minSalary || maxSalary) {
      salaryQuery.paySalary = {};
      if (minSalary) salaryQuery.paySalary.$gte = Number(minSalary);
      if (maxSalary) salaryQuery.paySalary.$lte = Number(maxSalary);
    }

    // Effective date range filter
    const fromDate = effectiveDateFrom || startDate;
    const toDate = effectiveDateTo || endDate;
    if (fromDate || toDate) {
      salaryQuery.effectiveDate = {};
      if (fromDate) salaryQuery.effectiveDate.$gte = new Date(String(fromDate));
      if (toDate) salaryQuery.effectiveDate.$lte = new Date(String(toDate));
    }

    // Pagination & Sorting
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const validSortFields: Record<string, string> = {
      effectiveDate: "effectiveDate",
      paySalary: "paySalary",
      baseSalary: "baseSalary",
      createdAt: "createdAt",
    };

    const sortField = validSortFields[String(sortBy)] || "effectiveDate";
    const orderDirection = sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortField]: orderDirection };

    const [salaries, total] = await Promise.all([
      Salary.find(salaryQuery)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: "employeeId",
          select: "employeeCode firstName lastName email jobTitle departmentId status",
          populate: { path: "departmentId", select: "name" },
        })
        .populate("currencyId", "code name exRate")
        .lean(),
      Salary.countDocuments(salaryQuery),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, "Salaries retrieved successfully.", {
      salaries,
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
    console.error("[Salary] Get salaries error:", error);
    sendResponse(res, 500, "Failed to retrieve salaries.");
  }
};

/**
 * @desc   Get single salary record by ID
 * @route  GET /api/salaries/:id
 * @access Private
 */
export const getSalaryById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid salary ID format.");
      return;
    }

    const salary = await Salary.findById(id)
      .populate({
        path: "employeeId",
        select: "orgId employeeCode firstName lastName email jobTitle departmentId countryId employmentType status",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "countryId", select: "name code" },
        ],
      })
      .populate("currencyId", "code name exRate");

    if (!salary) {
      sendResponse(res, 404, "Salary record not found.");
      return;
    }

    // Verify employee belongs to caller's organization
    const employeeObj: any = salary.employeeId;
    if (!employeeObj || String(employeeObj.orgId) !== String(orgId)) {
      sendResponse(res, 404, "Salary record not found in your organization.");
      return;
    }

    sendResponse(res, 200, "Salary record retrieved successfully.", { salary });
  } catch (error: any) {
    console.error("[Salary] Get salary by ID error:", error);
    sendResponse(res, 500, "Failed to retrieve salary record.");
  }
};

/**
 * @desc   Create new salary record / revision for an employee
 * @route  POST /api/salaries
 * @access Private
 */
export const createSalary = async (
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
      employeeId,
      baseSalary,
      paySalary,
      currencyId,
      effectiveDate,
      remark,
      updateEmployeeCurrentSalary = true,
      sendSlipEmail = false,
    } = req.body;

    if (!employeeId || baseSalary === undefined || !effectiveDate) {
      sendResponse(
        res,
        400,
        "Missing required fields: employeeId, baseSalary, effectiveDate.",
      );
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(String(employeeId))) {
      sendResponse(res, 400, "Invalid employeeId format.");
      return;
    }

    // Verify employee exists and belongs to this organization
    const employee = await Employee.findOne({ _id: employeeId, orgId })
      .populate("departmentId", "name")
      .populate("countryId", "name code");

    if (!employee) {
      sendResponse(res, 404, "Employee not found in your organization.");
      return;
    }

    const parsedDate = new Date(effectiveDate);
    const targetCurrencyId = currencyId || employee.currencyId;
    const finalPaySalary = paySalary !== undefined ? Number(paySalary) : Number(baseSalary);

    // Verify unique constraint: [employeeId, effectiveDate]
    const existing = await Salary.findOne({
      employeeId: employee._id,
      effectiveDate: parsedDate,
    });

    if (existing) {
      sendResponse(
        res,
        400,
        `A salary record for this employee already exists on date ${parsedDate.toISOString().slice(0, 10)}. Use PUT /api/salaries/${existing._id} to update it.`,
      );
      return;
    }

    // Create salary ledger entry
    const newSalary = await Salary.create({
      employeeId: employee._id,
      baseSalary: Number(baseSalary),
      paySalary: finalPaySalary,
      currencyId: targetCurrencyId,
      effectiveDate: parsedDate,
      remark: remark ? String(remark).trim() : undefined,
    });

    // Optionally synchronize with employee current salary profile
    if (updateEmployeeCurrentSalary) {
      // Check if this new salary is the latest effective date
      const latestSalary = await Salary.findOne({ employeeId: employee._id })
        .sort({ effectiveDate: -1, createdAt: -1 });

      if (latestSalary && String(latestSalary._id) === String(newSalary._id)) {
        employee.salary = finalPaySalary;
        employee.currencyId = targetCurrencyId;
        await employee.save();
      }
    }

    // Optionally dispatch official salary slip PDF to employee
    if (sendSlipEmail) {
      const populatedSalary = await Salary.findById(newSalary._id).populate(
        "currencyId",
        "code name exRate",
      );
      const organization = await Organization.findById(orgId);

      const currencyObj: any = populatedSalary?.currencyId;
      const departmentObj: any = employee.departmentId;
      const countryObj: any = employee.countryId;

      generateSalarySlipPDF({
        organizationName: organization?.name || "Salary Management",
        organizationEmail: organization?.email,
        employeeCode: employee.employeeCode,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        jobTitle: employee.jobTitle,
        departmentName: departmentObj?.name,
        countryName: countryObj?.name,
        employmentType: employee.employmentType,
        baseSalary: newSalary.baseSalary,
        paySalary: newSalary.paySalary,
        currencyCode: currencyObj?.code || "USD",
        currencyName: currencyObj?.name,
        exchangeRate: currencyObj?.exRate,
        effectiveDate: newSalary.effectiveDate,
        remark: newSalary.remark,
        salaryId: String(newSalary._id),
      })
        .then((pdfBuffer) => {
          const effectiveDateStr = new Date(newSalary.effectiveDate).toISOString().slice(0, 7);
          const safeFilename = `SalarySlip_${employee.employeeCode}_${effectiveDateStr}.pdf`;

          return sendEmail({
            to: employee.email,
            subject: `Official Salary Slip - ${employee.employeeCode} (${new Date(newSalary.effectiveDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })})`,
            text: `Dear ${employee.firstName} ${employee.lastName},\n\nYour salary slip for ${effectiveDateStr} is attached as a PDF.\nNet Payable: ${currencyObj?.code || "USD"} ${newSalary.paySalary.toLocaleString()}\n\nBest regards,\nPayroll Team`,
            attachments: [
              {
                filename: safeFilename,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });
        })
        .catch((mailErr) => {
          console.warn("[Salary] Auto slip email dispatch failed:", mailErr.message);
        });
    }

    sendResponse(res, 201, "Salary record created successfully.", {
      salary: newSalary,
    });
  } catch (error: any) {
    console.error("[Salary] Create salary error:", error);
    sendResponse(res, 500, "Failed to create salary record.");
  }
};

/**
 * @desc   Update existing salary record
 * @route  PUT /api/salaries/:id
 * @access Private
 */
export const updateSalary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid salary ID format.");
      return;
    }

    const salary = await Salary.findById(id).populate("employeeId");
    if (!salary) {
      sendResponse(res, 404, "Salary record not found.");
      return;
    }

    const employee: any = salary.employeeId;
    if (!employee || String(employee.orgId) !== String(orgId)) {
      sendResponse(res, 404, "Salary record not found in your organization.");
      return;
    }

    const {
      baseSalary,
      paySalary,
      currencyId,
      effectiveDate,
      remark,
      syncWithEmployee = true,
    } = req.body;

    if (effectiveDate) {
      const newDate = new Date(effectiveDate);
      if (newDate.getTime() !== salary.effectiveDate.getTime()) {
        const existing = await Salary.findOne({
          employeeId: employee._id,
          effectiveDate: newDate,
          _id: { $ne: salary._id },
        });

        if (existing) {
          sendResponse(
            res,
            400,
            `Another salary record already exists on date ${newDate.toISOString().slice(0, 10)}.`,
          );
          return;
        }
        salary.effectiveDate = newDate;
      }
    }

    if (baseSalary !== undefined) salary.baseSalary = Number(baseSalary);
    if (paySalary !== undefined) salary.paySalary = Number(paySalary);
    if (currencyId) salary.currencyId = currencyId;
    if (remark !== undefined) salary.remark = String(remark).trim();

    await salary.save();

    // Optionally synchronize with employee current salary
    if (syncWithEmployee) {
      const latestSalary = await Salary.findOne({ employeeId: employee._id })
        .sort({ effectiveDate: -1, createdAt: -1 });

      if (latestSalary && String(latestSalary._id) === String(salary._id)) {
        await Employee.updateOne(
          { _id: employee._id },
          { salary: salary.paySalary, currencyId: salary.currencyId },
        );
      }
    }

    sendResponse(res, 200, "Salary record updated successfully.", { salary });
  } catch (error: any) {
    console.error("[Salary] Update salary error:", error);
    sendResponse(res, 500, "Failed to update salary record.");
  }
};

/**
 * @desc   Delete salary record
 * @route  DELETE /api/salaries/:id
 * @access Private
 */
export const deleteSalary = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid salary ID format.");
      return;
    }

    const salary = await Salary.findById(id).populate("employeeId");
    if (!salary) {
      sendResponse(res, 404, "Salary record not found.");
      return;
    }

    const employee: any = salary.employeeId;
    if (!employee || String(employee.orgId) !== String(orgId)) {
      sendResponse(res, 404, "Salary record not found in your organization.");
      return;
    }

    await Salary.deleteOne({ _id: id });

    // Sync employee current salary to the new latest salary (if any)
    const newLatest = await Salary.findOne({ employeeId: employee._id })
      .sort({ effectiveDate: -1, createdAt: -1 });

    if (newLatest) {
      await Employee.updateOne(
        { _id: employee._id },
        { salary: newLatest.paySalary, currencyId: newLatest.currencyId },
      );
    }

    sendResponse(res, 200, "Salary record deleted successfully.");
  } catch (error: any) {
    console.error("[Salary] Delete salary error:", error);
    sendResponse(res, 500, "Failed to delete salary record.");
  }
};

/**
 * @desc   Download or stream salary slip as PDF
 * @route  GET /api/salaries/:id/pdf
 * @access Private
 */
export const downloadSalarySlipPDF = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid salary ID format.");
      return;
    }

    const salary = await Salary.findById(id)
      .populate({
        path: "employeeId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "countryId", select: "name code" },
        ],
      })
      .populate("currencyId", "code name exRate");

    if (!salary) {
      sendResponse(res, 404, "Salary record not found.");
      return;
    }

    const employee: any = salary.employeeId;
    if (!employee || String(employee.orgId) !== String(orgId)) {
      sendResponse(res, 404, "Salary record not found in your organization.");
      return;
    }

    const organization = await Organization.findById(orgId);
    const currencyObj: any = salary.currencyId;
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
      baseSalary: salary.baseSalary,
      paySalary: salary.paySalary,
      currencyCode: currencyObj?.code || "USD",
      currencyName: currencyObj?.name,
      exchangeRate: currencyObj?.exRate,
      effectiveDate: salary.effectiveDate,
      remark: salary.remark,
      salaryId: String(salary._id),
    });

    const dateStr = new Date(salary.effectiveDate).toISOString().slice(0, 7);
    const filename = `SalarySlip_${employee.employeeCode}_${dateStr}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("[Salary] Download PDF error:", error);
    sendResponse(res, 500, "Failed to generate salary slip PDF.");
  }
};

/**
 * @desc   Directly dispatch salary slip PDF to employee email
 * @route  POST /api/salaries/:id/send-email
 * @access Private
 */
export const sendSalarySlipEmailDirectly = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid salary ID format.");
      return;
    }

    const salary = await Salary.findById(id)
      .populate({
        path: "employeeId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "countryId", select: "name code" },
        ],
      })
      .populate("currencyId", "code name exRate");

    if (!salary) {
      sendResponse(res, 404, "Salary record not found.");
      return;
    }

    const employee: any = salary.employeeId;
    if (!employee || String(employee.orgId) !== String(orgId)) {
      sendResponse(res, 404, "Salary record not found in your organization.");
      return;
    }

    const organization = await Organization.findById(orgId);
    const currencyObj: any = salary.currencyId;
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
      baseSalary: salary.baseSalary,
      paySalary: salary.paySalary,
      currencyCode: currencyObj?.code || "USD",
      currencyName: currencyObj?.name,
      exchangeRate: currencyObj?.exRate,
      effectiveDate: salary.effectiveDate,
      remark: salary.remark,
      salaryId: String(salary._id),
    });

    const effectiveDateStr = new Date(salary.effectiveDate).toISOString().slice(0, 7);
    const safeFilename = `SalarySlip_${employee.employeeCode}_${effectiveDateStr}.pdf`;
    const curCode = currencyObj?.code || "USD";
    const formattedSalary = Number(salary.paySalary).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const formattedDate = new Date(salary.effectiveDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #1e293b; padding: 18px 20px; border-radius: 6px; margin-bottom: 22px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Official Salary Slip</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Remuneration Statement & Payslip Notification</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.5;">Dear <strong>${employee.firstName} ${employee.lastName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #334155;">
          Your official salary slip for the pay period ending <strong>${formattedDate}</strong> is attached to this email as a PDF document.
        </p>

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
            <td style="padding: 10px 14px; text-align: right; color: #0f172a;">${formattedDate}</td>
          </tr>
          <tr style="background-color: #ecfdf5; border-bottom: 2px solid #10b981;">
            <td style="padding: 12px 14px; font-weight: bold; color: #065f46;">Net Payable Salary</td>
            <td style="padding: 12px 14px; font-weight: bold; text-align: right; color: #065f46; font-size: 16px;">${curCode} ${formattedSalary}</td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          Please review the attached PDF document for full compensation breakdowns and exchange rate details.
        </p>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
          This is an automated communication from the Payroll & HR Management System.
        </div>
      </div>
    `;

    await sendEmail({
      to: employee.email,
      subject: `Official Salary Slip - ${employee.employeeCode} (${new Date(salary.effectiveDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })})`,
      text: `Dear ${employee.firstName} ${employee.lastName},\n\nYour salary slip for ${formattedDate} is attached as a PDF.\nNet Payable: ${curCode} ${formattedSalary}\nEmployee Code: ${employee.employeeCode}\n\nBest regards,\nPayroll Team`,
      html: htmlContent,
      attachments: [
        {
          filename: safeFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    sendResponse(
      res,
      200,
      `Salary slip email dispatched successfully to ${employee.email} (${employee.employeeCode}).`,
      {
        recipient: employee.email,
        employeeCode: employee.employeeCode,
        salarySlipAttached: true,
      },
    );
  } catch (error: any) {
    console.error("[Salary] Send email directly error:", error);
    sendResponse(res, 500, `Failed to dispatch salary slip email: ${error.message}`);
  }
};
