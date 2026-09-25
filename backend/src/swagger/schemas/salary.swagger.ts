export const salarySchemas = {
  Salary: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b901" },
      employeeId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b801" },
      baseSalary: { type: "number", minimum: 1, example: 120000 },
      paySalary: { type: "number", minimum: 1, example: 120000 },
      currencyId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7e1" },
      effectiveDate: { type: "string", format: "date", example: "2024-01-01" },
      remark: { type: "string", example: "Annual Performance Increment" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateSalaryInput: {
    type: "object",
    required: ["baseSalary", "paySalary", "currencyId", "effectiveDate"],
    properties: {
      baseSalary: { type: "number", minimum: 1, example: 130000 },
      paySalary: { type: "number", minimum: 1, example: 130000 },
      currencyId: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7e1" },
      effectiveDate: { type: "string", format: "date", example: "2025-01-01" },
      remark: { type: "string", example: "Promotion to Lead Engineer" },
    },
  },
};
