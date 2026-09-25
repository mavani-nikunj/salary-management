export const departmentSchemas = {
  Department: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7f1" },
      orgId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7c8" },
      name: { type: "string", example: "Engineering" },
      status: { type: "string", enum: ["Active", "Inactive"], example: "Active" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateDepartmentInput: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Engineering" },
      status: { type: "string", enum: ["Active", "Inactive"], default: "Active" },
    },
  },
};
