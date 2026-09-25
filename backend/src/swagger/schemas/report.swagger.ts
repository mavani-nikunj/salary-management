export const reportSchemas = {
  PayrollOverviewReport: {
    type: "object",
    properties: {
      headcount: {
        type: "object",
        properties: {
          total: { type: "integer", example: 10000 },
          active: { type: "integer", example: 9850 },
          inactive: { type: "integer", example: 150 },
          departments: { type: "integer", example: 10 },
        },
      },
      payrollMetrics: {
        type: "object",
        properties: {
          totalPayrollNominal: { type: "number", example: 45000000 },
          averageSalary: { type: "number", example: 4500 },
          minSalary: { type: "number", example: 800 },
          maxSalary: { type: "number", example: 18500 },
          totalPayrollINR: { type: "number", example: 3750000000 },
          totalPayrollUSD: { type: "number", example: 45000000 },
        },
      },
      departmentBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            departmentId: { type: "string" },
            departmentName: { type: "string", example: "Engineering" },
            employeeCount: { type: "integer", example: 1420 },
            totalPayroll: { type: "number", example: 8520000 },
            averageSalary: { type: "number", example: 6000 },
          },
        },
      },
      levelBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            level: { type: "string", example: "senior" },
            employeeCount: { type: "integer", example: 2500 },
            totalPayroll: { type: "number", example: 17500000 },
            averageSalary: { type: "number", example: 7000 },
          },
        },
      },
      employmentTypeBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            employmentType: { type: "string", example: "Full-time" },
            employeeCount: { type: "integer", example: 9200 },
            totalPayroll: { type: "number", example: 42000000 },
          },
        },
      },
      currencyBreakdown: {
        type: "array",
        items: {
          type: "object",
          properties: {
            currencyCode: { type: "string", example: "USD" },
            employeeCount: { type: "integer", example: 4500 },
            totalSalaryAmount: { type: "number", example: 24500000 },
          },
        },
      },
    },
  },
  DepartmentCompensationReport: {
    type: "array",
    items: {
      type: "object",
      properties: {
        departmentId: { type: "string" },
        departmentName: { type: "string", example: "Engineering" },
        status: { type: "string", example: "Active" },
        headcount: { type: "integer", example: 1250 },
        activeHeadcount: { type: "integer", example: 1220 },
        totalPayroll: { type: "number", example: 7500000 },
        averageSalary: { type: "number", example: 6000 },
        minSalary: { type: "number", example: 2500 },
        maxSalary: { type: "number", example: 18000 },
        levels: {
          type: "object",
          example: { junior: 200, mid: 500, senior: 350, lead: 150, manager: 50 },
        },
      },
    },
  },
  PayrollTrendReport: {
    type: "array",
    items: {
      type: "object",
      properties: {
        yearMonth: { type: "string", example: "2025-01" },
        revisionsCount: { type: "integer", example: 45 },
        totalDisbursed: { type: "number", example: 3450000 },
        averageSalary: { type: "number", example: 7666.67 },
      },
    },
  },
};
