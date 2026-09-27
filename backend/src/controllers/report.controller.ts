import { Response } from "express";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { Employee, Salary, Department, Country, Currency } from "../models";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * @desc   Get comprehensive organization compensation & payroll overview report
 * @route  GET /api/reports/overview
 * @access Private
 */
export const getOverviewReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    // Fetch USD currency to compute global USD normalized totals
    const usdCurrency = await Currency.findOne({ code: "USD" });
    const usdExRate = usdCurrency?.exRate || 0.012; // fallback if not set

    // Run parallel aggregation pipelines for high performance
    const [
      headcountStats,
      salaryStats,
      departmentAgg,
      levelAgg,
      employmentTypeAgg,
      currencyAgg,
      countryAgg,
      totalDepartmentsCount,
    ] = await Promise.all([
      // 1. Headcount breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            inactive: {
              $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] },
            },
          },
        },
      ]),

      // 2. Nominal Salary Metrics (Active employees)
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: null,
            totalPayrollNominal: { $sum: "$salary" },
            averageSalary: { $avg: "$salary" },
            minSalary: { $min: "$salary" },
            maxSalary: { $max: "$salary" },
          },
        },
      ]),

      // 3. Department Breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$departmentId",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
            averageSalary: { $avg: "$salary" },
            minSalary: { $min: "$salary" },
            maxSalary: { $max: "$salary" },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentId: "$_id",
            departmentName: { $ifNull: ["$department.name", "Unassigned"] },
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
            averageSalary: { $round: ["$averageSalary", 2] },
            minSalary: 1,
            maxSalary: 1,
          },
        },
        { $sort: { employeeCount: -1 } },
      ]),

      // 4. Level Breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$level",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
            averageSalary: { $avg: "$salary" },
          },
        },
        {
          $project: {
            level: "$_id",
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
            averageSalary: { $round: ["$averageSalary", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
      ]),

      // 5. Employment Type Breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$employmentType",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
            averageSalary: { $avg: "$salary" },
          },
        },
        {
          $project: {
            employmentType: "$_id",
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
            averageSalary: { $round: ["$averageSalary", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
      ]),

      // 6. Currency Breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$currencyId",
            employeeCount: { $sum: 1 },
            totalSalaryAmount: { $sum: "$salary" },
          },
        },
        {
          $lookup: {
            from: "currencies",
            localField: "_id",
            foreignField: "_id",
            as: "currency",
          },
        },
        { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            currencyId: "$_id",
            currencyCode: { $ifNull: ["$currency.code", "UNKNOWN"] },
            currencyName: { $ifNull: ["$currency.name", "Unknown Currency"] },
            exRate: { $ifNull: ["$currency.exRate", 1] },
            employeeCount: 1,
            totalSalaryAmount: { $round: ["$totalSalaryAmount", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
      ]),

      // 7. Top Countries Breakdown
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$countryId",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
          },
        },
        {
          $lookup: {
            from: "countries",
            localField: "_id",
            foreignField: "_id",
            as: "country",
          },
        },
        { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            countryId: "$_id",
            countryCode: { $ifNull: ["$country.code", "??"] },
            countryName: { $ifNull: ["$country.name", "Unknown"] },
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
        { $limit: 15 },
      ]),

      // 8. Total Department count
      Department.countDocuments({ orgId: orgObjectId }),
    ]);

    // Compute normalized INR & USD totals using currency exchange rates
    let totalPayrollINR = 0;
    for (const cur of currencyAgg) {
      const rate = cur.exRate > 0 ? cur.exRate : 1;
      const inrEquivalent = cur.totalSalaryAmount / rate;
      totalPayrollINR += inrEquivalent;
    }
    const totalPayrollUSD = totalPayrollINR * usdExRate;

    const headcount = headcountStats[0] || { total: 0, active: 0, inactive: 0 };
    const nominalMetrics = salaryStats[0] || {
      totalPayrollNominal: 0,
      averageSalary: 0,
      minSalary: 0,
      maxSalary: 0,
    };

    sendResponse(res, 200, "Overview compensation report retrieved successfully.", {
      headcount: {
        total: headcount.total,
        active: headcount.active,
        inactive: headcount.inactive,
        departments: totalDepartmentsCount,
      },
      payrollMetrics: {
        totalPayrollNominal: Math.round(nominalMetrics.totalPayrollNominal * 100) / 100,
        averageSalary: Math.round(nominalMetrics.averageSalary * 100) / 100,
        minSalary: nominalMetrics.minSalary,
        maxSalary: nominalMetrics.maxSalary,
        totalPayrollINR: Math.round(totalPayrollINR * 100) / 100,
        totalPayrollUSD: Math.round(totalPayrollUSD * 100) / 100,
      },
      departmentBreakdown: departmentAgg,
      levelBreakdown: levelAgg,
      employmentTypeBreakdown: employmentTypeAgg,
      currencyBreakdown: currencyAgg,
      countryBreakdown: countryAgg,
    });
  } catch (error: any) {
    console.error("[Report] Overview report error:", error);
    sendResponse(res, 500, "Failed to generate compensation overview report.");
  }
};

/**
 * @desc   Get department-level compensation analytics and headcount breakdown
 * @route  GET /api/reports/departments
 * @access Private
 */
export const getDepartmentCompensationReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const departments = await Department.find({ orgId: orgObjectId }).lean();

    const departmentStats = await Employee.aggregate([
      { $match: { orgId: orgObjectId } },
      {
        $group: {
          _id: "$departmentId",
          headcount: { $sum: 1 },
          activeHeadcount: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          totalPayroll: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", 0] },
          },
          averageSalary: {
            $avg: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", null] },
          },
          minSalary: {
            $min: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", null] },
          },
          maxSalary: {
            $max: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", null] },
          },
          juniorCount: {
            $sum: { $cond: [{ $eq: ["$level", "junior"] }, 1, 0] },
          },
          midCount: {
            $sum: { $cond: [{ $eq: ["$level", "mid"] }, 1, 0] },
          },
          seniorCount: {
            $sum: { $cond: [{ $eq: ["$level", "senior"] }, 1, 0] },
          },
          leadCount: {
            $sum: { $cond: [{ $eq: ["$level", "lead"] }, 1, 0] },
          },
          managerCount: {
            $sum: { $cond: [{ $eq: ["$level", "manager"] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = new Map<string, any>();
    departmentStats.forEach((s) => {
      statsMap.set(String(s._id), s);
    });

    const report = departments.map((d) => {
      const stats = statsMap.get(String(d._id)) || {};
      const totalPayroll = Math.round((stats.totalPayroll || 0) * 100) / 100;
      const averageSalary = Math.round((stats.averageSalary || 0) * 100) / 100;
      const minSalary = stats.minSalary || 0;
      const maxSalary = stats.maxSalary || 0;

      return {
        departmentId: d._id,
        departmentName: d.name,
        department: d.name,
        status: d.status,
        headcount: stats.headcount || 0,
        activeHeadcount: stats.activeHeadcount || 0,
        totalPayroll,
        totalSalaryINR: totalPayroll,
        averageSalary,
        avgSalaryINR: averageSalary,
        minSalary,
        minSalaryINR: minSalary,
        maxSalary,
        maxSalaryINR: maxSalary,
        levels: {
          junior: stats.juniorCount || 0,
          mid: stats.midCount || 0,
          senior: stats.seniorCount || 0,
          lead: stats.leadCount || 0,
          manager: stats.managerCount || 0,
        },
      };
    });

    // Sort by active headcount descending
    report.sort((a, b) => b.activeHeadcount - a.activeHeadcount);

    sendResponse(res, 200, "Department compensation report retrieved successfully.", {
      departments: report,
    });
  } catch (error: any) {
    console.error("[Report] Department report error:", error);
    sendResponse(res, 500, "Failed to generate department compensation report.");
  }
};

/**
 * @desc   Get historical monthly payroll and salary revision trend
 * @route  GET /api/reports/payroll-history
 * @access Private
 */
export const getPayrollTrendReport = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const { months = "12" } = req.query;
    const monthsCount = Math.min(60, Math.max(1, parseInt(String(months), 10) || 12));

    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    // Fetch USD currency to compute USD normalized totals
    const usdCurrency = await Currency.findOne({ code: "USD" });
    const usdExRate = usdCurrency?.exRate || 0.012;

    // Retrieve matching employee IDs for this organization
    const orgEmployees = await Employee.find({ orgId: orgObjectId }).select("_id").lean();
    const empIds = orgEmployees.map((e) => e._id);

    const trends = await Salary.aggregate([
      { $match: { employeeId: { $in: empIds } } },
      {
        $lookup: {
          from: "currencies",
          localField: "currencyId",
          foreignField: "_id",
          as: "currency",
        },
      },
      { $unwind: { path: "$currency", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$effectiveDate" },
          },
          revisionsCount: { $sum: 1 },
          totalDisbursed: { $sum: "$paySalary" },
          totalDisbursedINR: {
            $sum: {
              $divide: [
                "$paySalary",
                { $cond: [{ $gt: ["$currency.exRate", 0] }, "$currency.exRate", 1] },
              ],
            },
          },
          averageSalary: { $avg: "$paySalary" },
        },
      },
      {
        $project: {
          month: "$_id",
          yearMonth: "$_id",
          count: "$revisionsCount",
          revisionsCount: 1,
          totalDisbursed: { $round: ["$totalDisbursed", 2] },
          totalPayrollINR: { $round: ["$totalDisbursedINR", 2] },
          totalPayrollUSD: { $round: [{ $multiply: ["$totalDisbursedINR", usdExRate] }, 2] },
          averageSalary: { $round: ["$averageSalary", 2] },
        },
      },
      { $sort: { month: -1 } },
      { $limit: monthsCount },
    ]);

    // Reverse to chronological order (oldest to newest)
    trends.reverse();

    sendResponse(res, 200, "Payroll trend report retrieved successfully.", {
      trends,
    });
  } catch (error: any) {
    console.error("[Report] Payroll trend report error:", error);
    sendResponse(res, 500, "Failed to generate payroll trend report.");
  }
};

/**
 * @desc   Export multi-sheet payroll & compensation report to Excel (.xlsx)
 * @route  GET /api/reports/export/excel
 * @access Private
 */
export const exportPayrollExcel = async (
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
      departmentId,
      countryId,
      status,
      level,
      employmentType,
      minSalary,
      maxSalary,
    } = req.query;

    const query: any = { orgId: new mongoose.Types.ObjectId(orgId) };

    if (departmentId) {
      const raw = Array.isArray(departmentId) ? departmentId : String(departmentId).split(",");
      const valid = raw.filter((id) => mongoose.Types.ObjectId.isValid(String(id).trim()));
      if (valid.length > 0) query.departmentId = { $in: valid };
    }

    if (countryId) {
      const raw = Array.isArray(countryId) ? countryId : String(countryId).split(",");
      const valid = raw.filter((id) => mongoose.Types.ObjectId.isValid(String(id).trim()));
      if (valid.length > 0) query.countryId = { $in: valid };
    }

    if (status && status !== "All") query.status = status;
    if (level) query.level = level;
    if (employmentType) query.employmentType = employmentType;

    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    // Fetch employees with populated details
    const employees = await Employee.find(query)
      .populate("departmentId", "name")
      .populate("countryId", "name code")
      .populate("currencyId", "code name exRate")
      .sort({ createdAt: -1 })
      .lean();

    // 1. Build Sheet 1: Employee Payroll Register
    const registerRows = employees.map((emp: any, index: number) => {
      const cur = emp.currencyId;
      const exRate = cur?.exRate > 0 ? cur.exRate : 1;
      const inrEquivalent = cur ? Math.round((emp.salary / exRate) * 100) / 100 : emp.salary;

      return {
        "No.": index + 1,
        "Employee Code": emp.employeeCode,
        "First Name": emp.firstName,
        "Last Name": emp.lastName,
        "Official Email": emp.email,
        "Job Title": emp.jobTitle,
        "Department": emp.departmentId?.name || "N/A",
        "Country": emp.countryId?.name || "N/A",
        "Role": emp.role,
        "Level": emp.level,
        "Employment Type": emp.employmentType,
        "Salary": emp.salary,
        "Currency": cur?.code || "USD",
        "ExRate vs INR": exRate,
        "Approx Value (INR)": inrEquivalent,
        "Hire Date": emp.hireDate ? new Date(emp.hireDate).toISOString().slice(0, 10) : "",
        "Status": emp.status,
      };
    });

    // 2. Build Sheet 2: Department Summary
    const deptMap = new Map<string, { count: number; total: number }>();
    employees.forEach((emp: any) => {
      const name = emp.departmentId?.name || "Unassigned";
      const current = deptMap.get(name) || { count: 0, total: 0 };
      current.count += 1;
      current.total += emp.salary;
      deptMap.set(name, current);
    });

    const deptRows = Array.from(deptMap.entries()).map(([name, data]) => ({
      "Department": name,
      "Employee Count": data.count,
      "Total Payroll": Math.round(data.total * 100) / 100,
      "Average Salary": Math.round((data.total / data.count) * 100) / 100,
    }));

    // 3. Build Sheet 3: Country Summary
    const countryMap = new Map<string, { code: string; count: number; total: number }>();
    employees.forEach((emp: any) => {
      const name = emp.countryId?.name || "Unassigned";
      const code = emp.countryId?.code || "--";
      const current = countryMap.get(name) || { code, count: 0, total: 0 };
      current.count += 1;
      current.total += emp.salary;
      countryMap.set(name, current);
    });

    const countryRows = Array.from(countryMap.entries()).map(([name, data]) => ({
      "Country Code": data.code,
      "Country Name": name,
      "Employee Count": data.count,
      "Total Payroll": Math.round(data.total * 100) / 100,
      "Average Salary": Math.round((data.total / data.count) * 100) / 100,
    }));

    // Create XLSX Workbook & Sheets
    const workbook = XLSX.utils.book_new();

    const sheet1 = XLSX.utils.json_to_sheet(registerRows);
    XLSX.utils.book_append_sheet(workbook, sheet1, "Payroll Register");

    const sheet2 = XLSX.utils.json_to_sheet(deptRows);
    XLSX.utils.book_append_sheet(workbook, sheet2, "Department Summary");

    const sheet3 = XLSX.utils.json_to_sheet(countryRows);
    XLSX.utils.book_append_sheet(workbook, sheet3, "Country Summary");

    // Write binary buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Payroll_Report_${timestamp}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (error: any) {
    console.error("[Report] Export Excel error:", error);
    sendResponse(res, 500, "Failed to generate Excel payroll report.");
  }
};

/**
 * @desc   Export employee payroll register to CSV
 * @route  GET /api/reports/export/csv
 * @access Private
 */
export const exportPayrollCsv = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const employees = await Employee.find({ orgId: new mongoose.Types.ObjectId(orgId) })
      .populate("departmentId", "name")
      .populate("countryId", "name code")
      .populate("currencyId", "code exRate")
      .sort({ createdAt: -1 })
      .lean();

    const rows = employees.map((emp: any, index: number) => {
      const cur = emp.currencyId;
      const exRate = cur?.exRate > 0 ? cur.exRate : 1;
      const inrEquivalent = cur ? Math.round((emp.salary / exRate) * 100) / 100 : emp.salary;

      return {
        "No.": index + 1,
        "Employee Code": emp.employeeCode,
        "First Name": emp.firstName,
        "Last Name": emp.lastName,
        "Official Email": emp.email,
        "Job Title": emp.jobTitle,
        "Department": emp.departmentId?.name || "N/A",
        "Country": emp.countryId?.name || "N/A",
        "Level": emp.level,
        "Employment Type": emp.employmentType,
        "Salary": emp.salary,
        "Currency": cur?.code || "USD",
        "Approx Value (INR)": inrEquivalent,
        "Status": emp.status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Payroll_Register_${timestamp}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error: any) {
    console.error("[Report] Export CSV error:", error);
    sendResponse(res, 500, "Failed to generate CSV payroll export.");
  }
};
