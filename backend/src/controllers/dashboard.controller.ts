import { Response } from "express";
import mongoose from "mongoose";
import { Employee, Salary, Department, Currency, Country } from "../models";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../middlewares/auth.middleware";

/**
 * @desc   Get consolidated dashboard summary: KPIs, charts, and recent activity
 * @route  GET /api/dashboard
 * @access Private
 */
export const getDashboardSummary = async (
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

    // 30 days window calculation
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch USD exRate for normalized calculations
    const usdCurrency = await Currency.findOne({ code: "USD" });
    const usdExRate = usdCurrency?.exRate || 0.012;

    // Parallel aggregations for blazing fast response times
    const [
      headcountAgg,
      payrollAgg,
      newHiresCount,
      leaversCount,
      deptCount,
      currenciesAgg,
      deptDistAgg,
      levelDistAgg,
      empTypeDistAgg,
      topDesignationsAgg,
      countryDistAgg,
      recentHiresList,
      recentRevisionsList,
      revisionsLast30DaysCount,
      monthlyTrendAgg,
    ] = await Promise.all([
      // 1. Headcount Breakdown
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

      // 2. Nominal Payroll Metrics
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

      // 3. New Hires in last 30 days
      Employee.countDocuments({
        orgId: orgObjectId,
        hireDate: { $gte: thirtyDaysAgo },
      }),

      // 4. Leavers in last 30 days
      Employee.countDocuments({
        orgId: orgObjectId,
        leaveDate: { $gte: thirtyDaysAgo },
      }),

      // 5. Total Departments
      Department.countDocuments({ orgId: orgObjectId }),

      // 6. Currency totals for INR/USD normalization
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$currencyId",
            totalAmount: { $sum: "$salary" },
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
            exRate: { $ifNull: ["$currency.exRate", 1] },
            totalAmount: 1,
          },
        },
      ]),

      // 7. Department Distribution (Top 8)
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$departmentId",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "_id",
            foreignField: "_id",
            as: "dept",
          },
        },
        { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            departmentId: "$_id",
            departmentName: { $ifNull: ["$dept.name", "Unassigned"] },
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
        { $limit: 8 },
      ]),

      // 8. Level Distribution
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$level",
            employeeCount: { $sum: 1 },
            totalPayroll: { $sum: "$salary" },
          },
        },
        {
          $project: {
            level: "$_id",
            employeeCount: 1,
            totalPayroll: { $round: ["$totalPayroll", 2] },
          },
        },
        { $sort: { employeeCount: -1 } },
      ]),

      // 9. Employment Type Distribution
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$employmentType",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            type: "$_id",
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),

      // 10. Top 5 Highest Paying Designations (with >= 3 employees)
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$jobTitle",
            employeeCount: { $sum: 1 },
            averageSalary: { $avg: "$salary" },
          },
        },
        { $match: { employeeCount: { $gte: 2 } } },
        {
          $project: {
            jobTitle: "$_id",
            employeeCount: 1,
            averageSalary: { $round: ["$averageSalary", 2] },
          },
        },
        { $sort: { averageSalary: -1 } },
        { $limit: 6 },
      ]),

      // 11. Country Distribution (Top 8)
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: "$countryId",
            employeeCount: { $sum: 1 },
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
            countryCode: { $ifNull: ["$country.code", "--"] },
            countryName: { $ifNull: ["$country.name", "Unknown"] },
            employeeCount: 1,
          },
        },
        { $sort: { employeeCount: -1 } },
        { $limit: 8 },
      ]),

      // 12. Recent Hires (Top 5)
      Employee.find({ orgId: orgObjectId })
        .sort({ hireDate: -1, createdAt: -1 })
        .limit(5)
        .populate("departmentId", "name")
        .select("employeeCode firstName lastName jobTitle hireDate salary status")
        .lean(),

      // 13. Recent Salary Revisions (Top 5)
      Salary.find()
        .populate({
          path: "employeeId",
          match: { orgId: orgObjectId },
          select: "employeeCode firstName lastName jobTitle orgId",
        })
        .populate("currencyId", "code symbol")
        .sort({ effectiveDate: -1, createdAt: -1 })
        .limit(10)
        .lean(),

      // 14. Salary revisions count in last 30 days
      Salary.countDocuments({
        effectiveDate: { $gte: thirtyDaysAgo },
      }),

      // 15. Monthly Trend (Past 6 months)
      Salary.aggregate([
        {
          $lookup: {
            from: "employees",
            localField: "employeeId",
            foreignField: "_id",
            as: "emp",
          },
        },
        { $unwind: "$emp" },
        { $match: { "emp.orgId": orgObjectId, effectiveDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$effectiveDate" } },
            totalDisbursed: { $sum: "$paySalary" },
            revisionsCount: { $sum: 1 },
          },
        },
        {
          $project: {
            month: "$_id",
            totalDisbursed: { $round: ["$totalDisbursed", 2] },
            revisionsCount: 1,
          },
        },
        { $sort: { month: 1 } },
      ]),
    ]);

    // Compute normalized INR & USD totals
    let totalPayrollINR = 0;
    for (const cur of currenciesAgg) {
      const rate = cur.exRate > 0 ? cur.exRate : 1;
      totalPayrollINR += cur.totalAmount / rate;
    }
    const totalPayrollUSD = totalPayrollINR * usdExRate;

    const headcount = headcountAgg[0] || { total: 0, active: 0, inactive: 0 };
    const nominal = payrollAgg[0] || {
      totalPayrollNominal: 0,
      averageSalary: 0,
      minSalary: 0,
      maxSalary: 0,
    };

    // Format recent salary revisions (filter out any where employee didn't match org)
    const formattedRecentRevisions = recentRevisionsList
      .filter((r: any) => r.employeeId)
      .slice(0, 5)
      .map((r: any) => ({
        _id: r._id,
        employeeCode: r.employeeId.employeeCode,
        employeeName: `${r.employeeId.firstName} ${r.employeeId.lastName}`,
        jobTitle: r.employeeId.jobTitle,
        baseSalary: r.baseSalary,
        paySalary: r.paySalary,
        currencyCode: r.currencyId?.code || "USD",
        effectiveDate: r.effectiveDate,
        remark: r.remark || "Salary Adjustment",
      }));

    // Format recent hires
    const formattedRecentHires = recentHiresList.map((h: any) => ({
      _id: h._id,
      employeeCode: h.employeeCode,
      fullName: `${h.firstName} ${h.lastName}`,
      jobTitle: h.jobTitle,
      departmentName: h.departmentId?.name || "Unassigned",
      hireDate: h.hireDate,
      salary: h.salary,
      status: h.status,
    }));

    sendResponse(res, 200, "Dashboard summary retrieved successfully.", {
      kpis: {
        totalEmployees: headcount.total,
        activeEmployees: headcount.active,
        inactiveEmployees: headcount.inactive,
        totalDepartments: deptCount,
        totalMonthlyPayrollNominal: Math.round(nominal.totalPayrollNominal * 100) / 100,
        totalMonthlyPayrollINR: Math.round(totalPayrollINR * 100) / 100,
        totalMonthlyPayrollUSD: Math.round(totalPayrollUSD * 100) / 100,
        averageSalary: Math.round(nominal.averageSalary * 100) / 100,
        minSalary: nominal.minSalary,
        maxSalary: nominal.maxSalary,
        newHiresLast30Days: newHiresCount,
        leaversLast30Days: leaversCount,
        revisionsLast30Days: revisionsLast30DaysCount,
      },
      charts: {
        monthlyPayrollTrend: monthlyTrendAgg,
        departmentDistribution: deptDistAgg,
        levelDistribution: levelDistAgg,
        employmentTypeDistribution: empTypeDistAgg,
        topPayingDesignations: topDesignationsAgg,
        countryDistribution: countryDistAgg,
      },
      recentActivity: {
        recentHires: formattedRecentHires,
        recentSalaryRevisions: formattedRecentRevisions,
      },
    });
  } catch (error: any) {
    console.error("[Dashboard] Get dashboard summary error:", error);
    sendResponse(res, 500, "Failed to retrieve dashboard summary.");
  }
};

/**
 * @desc   Get lightweight dashboard metrics / KPIs only
 * @route  GET /api/dashboard/metrics
 * @access Private
 */
export const getDashboardMetrics = async (
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

    const [headcountAgg, salaryAgg, deptCount] = await Promise.all([
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
      Employee.aggregate([
        { $match: { orgId: orgObjectId, status: "Active" } },
        {
          $group: {
            _id: null,
            totalMonthlyPayroll: { $sum: "$salary" },
            averageSalary: { $avg: "$salary" },
          },
        },
      ]),
      Department.countDocuments({ orgId: orgObjectId }),
    ]);

    const headcount = headcountAgg[0] || { total: 0, active: 0, inactive: 0 };
    const salary = salaryAgg[0] || { totalMonthlyPayroll: 0, averageSalary: 0 };

    sendResponse(res, 200, "Dashboard metrics retrieved successfully.", {
      totalEmployees: headcount.total,
      activeEmployees: headcount.active,
      inactiveEmployees: headcount.inactive,
      totalDepartments: deptCount,
      totalMonthlyPayroll: Math.round(salary.totalMonthlyPayroll * 100) / 100,
      averageSalary: Math.round(salary.averageSalary * 100) / 100,
    });
  } catch (error: any) {
    console.error("[Dashboard] Metrics error:", error);
    sendResponse(res, 500, "Failed to retrieve dashboard metrics.");
  }
};
