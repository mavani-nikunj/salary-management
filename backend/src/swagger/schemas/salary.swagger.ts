export const salarySchemas = {
  Salary: {
    type: "object",
    properties: {
      _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b901" },
      employeeId: {
        type: "object",
        description: "Populated employee information",
        properties: {
          _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b801" },
          employeeCode: { type: "string", example: "EMP-00001" },
          firstName: { type: "string", example: "Jane" },
          lastName: { type: "string", example: "Doe" },
          email: { type: "string", example: "jane.doe@acme.com" },
          jobTitle: { type: "string", example: "Lead Software Engineer" },
        },
      },
      baseSalary: { type: "number", minimum: 1, example: 120000 },
      paySalary: { type: "number", minimum: 1, example: 120000 },
      currencyId: {
        type: "object",
        description: "Populated currency details",
        properties: {
          _id: { type: "string", example: "64e0a1f8b1c2d3e4f5a6b7e1" },
          code: { type: "string", example: "USD" },
          name: { type: "string", example: "United States Dollar" },
          exRate: { type: "number", example: 0.012 },
        },
      },
      effectiveDate: { type: "string", format: "date", example: "2024-01-01" },
      remark: { type: "string", example: "Annual Performance Increment" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  CreateSalaryInput: {
    type: "object",
    required: ["employeeId", "baseSalary", "effectiveDate"],
    properties: {
      employeeId: {
        type: "string",
        description: "Employee ObjectId to associate with this salary revision",
        example: "64e0a1f8b1c2d3e4f5a6b801",
      },
      baseSalary: {
        type: "number",
        minimum: 1,
        description: "Base monthly or contracted salary amount",
        example: 130000,
      },
      paySalary: {
        type: "number",
        minimum: 1,
        description: "Net pay salary amount (defaults to baseSalary if omitted)",
        example: 130000,
      },
      currencyId: {
        type: "string",
        description: "Currency ObjectId (defaults to employee's assigned currency if omitted)",
        example: "64e0a1f8b1c2d3e4f5a6b7e1",
      },
      effectiveDate: {
        type: "string",
        format: "date",
        description: "Effective date of salary revision (YYYY-MM-DD)",
        example: "2025-01-01",
      },
      remark: {
        type: "string",
        description: "Reason or description for this salary revision",
        example: "Promotion to Senior Lead Engineer",
      },
      updateEmployeeCurrentSalary: {
        type: "boolean",
        description: "If true, synchronizes the employee's current salary and currency in the Employee profile (default: true)",
        default: true,
        example: true,
      },
      sendSlipEmail: {
        type: "boolean",
        description: "If true, immediately generates and dispatches the Salary Slip PDF to the employee's email (default: false)",
        default: false,
        example: false,
      },
    },
  },
  UpdateSalaryInput: {
    type: "object",
    properties: {
      baseSalary: {
        type: "number",
        minimum: 1,
        description: "Updated base salary amount",
        example: 135000,
      },
      paySalary: {
        type: "number",
        minimum: 1,
        description: "Updated net pay salary amount",
        example: 135000,
      },
      currencyId: {
        type: "string",
        description: "Updated Currency ObjectId",
        example: "64e0a1f8b1c2d3e4f5a6b7e1",
      },
      effectiveDate: {
        type: "string",
        format: "date",
        description: "Updated effective date (YYYY-MM-DD)",
        example: "2025-02-01",
      },
      remark: {
        type: "string",
        description: "Updated revision notes",
        example: "Market adjustment correction",
      },
      syncWithEmployee: {
        type: "boolean",
        description: "If true, syncs with employee's current salary profile if this record is the latest (default: true)",
        default: true,
        example: true,
      },
    },
  },
};
