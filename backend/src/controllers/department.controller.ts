import { Response } from "express";
import mongoose from "mongoose";
import { Department, Employee } from "@/models";
import { sendResponse } from "@/utils/response";
import { AuthRequest } from "@/middlewares/auth.middleware";

/**
 * @desc   Get departments with employee counts, status filter, search & pagination
 * @route  GET /api/departments
 * @access Private
 */
export const getDepartments = async (
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
      status,
      sortBy = "name",
      sortOrder = "asc",
      page = "1",
      limit = "50",
      all,
    } = req.query;

    const query: any = { orgId: new mongoose.Types.ObjectId(orgId) };

    if (status && status !== "All") {
      query.status = status;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      query.name = new RegExp(search.trim(), "i");
    }

    const isAll = String(all) === "true";
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = isAll ? 500 : Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));
    const skip = isAll ? 0 : (pageNum - 1) * limitNum;

    const validSortFields: Record<string, string> = {
      name: "name",
      status: "status",
      createdAt: "createdAt",
    };

    const sortField = validSortFields[String(sortBy)] || "name";
    const orderDirection = sortOrder === "desc" ? -1 : 1;
    const sort: any = { [sortField]: orderDirection };

    const [departments, total] = await Promise.all([
      Department.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Department.countDocuments(query),
    ]);

    // Aggregate employee counts per department for this organization
    const deptIds = departments.map((d) => d._id);
    const employeeCounts = await Employee.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), departmentId: { $in: deptIds } } },
      {
        $group: {
          _id: "$departmentId",
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = new Map<string, { total: number; active: number }>();
    employeeCounts.forEach((c) => {
      countMap.set(String(c._id), { total: c.totalEmployees, active: c.activeEmployees });
    });

    const enrichedDepartments = departments.map((dept) => {
      const counts = countMap.get(String(dept._id)) || { total: 0, active: 0 };
      return {
        ...dept,
        totalEmployees: counts.total,
        activeEmployees: counts.active,
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, "Departments retrieved successfully.", {
      departments: enrichedDepartments,
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
    console.error("[Department] Get departments error:", error);
    sendResponse(res, 500, "Failed to retrieve departments.");
  }
};

/**
 * @desc   Get single department by ID
 * @route  GET /api/departments/:id
 * @access Private
 */
export const getDepartmentById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid department ID format.");
      return;
    }

    const department = await Department.findOne({ _id: id, orgId }).lean();
    if (!department) {
      sendResponse(res, 404, "Department not found in your organization.");
      return;
    }

    // Get employee stats for this department
    const [stats] = await Employee.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), departmentId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
          },
          totalPayroll: {
            $sum: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", 0] },
          },
          averageSalary: {
            $avg: { $cond: [{ $eq: ["$status", "Active"] }, "$salary", null] },
          },
        },
      },
    ]);

    sendResponse(res, 200, "Department retrieved successfully.", {
      department: {
        ...department,
        totalEmployees: stats?.totalEmployees || 0,
        activeEmployees: stats?.activeEmployees || 0,
        totalPayroll: Math.round((stats?.totalPayroll || 0) * 100) / 100,
        averageSalary: Math.round((stats?.averageSalary || 0) * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error("[Department] Get department by ID error:", error);
    sendResponse(res, 500, "Failed to retrieve department.");
  }
};

/**
 * @desc   Create new department in organization
 * @route  POST /api/departments
 * @access Private
 */
export const createDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const orgId = req.orgId;
    if (!orgId) {
      sendResponse(res, 401, "Organization context required.");
      return;
    }

    const { name, status = "Active" } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      sendResponse(res, 400, "Department name is required.");
      return;
    }

    const cleanName = name.trim();

    // Check duplicate name within organization
    const existing = await Department.findOne({
      orgId,
      name: new RegExp(`^${cleanName}$`, "i"),
    });

    if (existing) {
      sendResponse(
        res,
        400,
        `Department with name '${cleanName}' already exists in your organization.`,
      );
      return;
    }

    const newDept = await Department.create({
      orgId,
      name: cleanName,
      status: status === "Inactive" ? "Inactive" : "Active",
    });

    sendResponse(res, 201, "Department created successfully.", {
      department: newDept,
    });
  } catch (error: any) {
    console.error("[Department] Create department error:", error);
    sendResponse(res, 500, "Failed to create department.");
  }
};

/**
 * @desc   Update department name or status
 * @route  PUT /api/departments/:id
 * @access Private
 */
export const updateDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid department ID format.");
      return;
    }

    const department = await Department.findOne({ _id: id, orgId });
    if (!department) {
      sendResponse(res, 404, "Department not found in your organization.");
      return;
    }

    const { name, status } = req.body;

    if (name && typeof name === "string" && name.trim() !== "") {
      const cleanName = name.trim();
      if (cleanName.toLowerCase() !== department.name.toLowerCase()) {
        const existing = await Department.findOne({
          orgId,
          name: new RegExp(`^${cleanName}$`, "i"),
          _id: { $ne: department._id },
        });

        if (existing) {
          sendResponse(
            res,
            400,
            `Another department named '${cleanName}' already exists in your organization.`,
          );
          return;
        }
      }
      department.name = cleanName;
    }

    if (status && (status === "Active" || status === "Inactive")) {
      department.status = status;
    }

    await department.save();

    sendResponse(res, 200, "Department updated successfully.", { department });
  } catch (error: any) {
    console.error("[Department] Update department error:", error);
    sendResponse(res, 500, "Failed to update department.");
  }
};

/**
 * @desc   Delete or soft-deactivate department
 * @route  DELETE /api/departments/:id
 * @access Private
 */
export const deleteDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { force } = req.query;
    const orgId = req.orgId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, "Invalid department ID format.");
      return;
    }

    const department = await Department.findOne({ _id: id, orgId });
    if (!department) {
      sendResponse(res, 404, "Department not found in your organization.");
      return;
    }

    // Check if any employees belong to this department
    const employeeCount = await Employee.countDocuments({
      orgId,
      departmentId: department._id,
    });

    if (employeeCount > 0 && force !== "true") {
      sendResponse(
        res,
        400,
        `Cannot delete department: ${employeeCount} employee(s) are currently assigned to it. Reassign employees or pass ?force=true to proceed.`,
        { employeeCount },
      );
      return;
    }

    await Department.deleteOne({ _id: id });

    sendResponse(res, 200, "Department deleted successfully.", {
      departmentId: id,
      deletedName: department.name,
    });
  } catch (error: any) {
    console.error("[Department] Delete department error:", error);
    sendResponse(res, 500, "Failed to delete department.");
  }
};
