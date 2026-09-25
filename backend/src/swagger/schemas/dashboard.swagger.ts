export const dashboardSchemas = {
  DashboardSummary: {
    type: "object",
    properties: {
      kpis: {
        type: "object",
        properties: {
          totalEmployees: { type: "integer", example: 10001 },
          activeEmployees: { type: "integer", example: 9850 },
          inactiveEmployees: { type: "integer", example: 151 },
          totalDepartments: { type: "integer", example: 10 },
          totalMonthlyPayrollNominal: { type: "number", example: 11588030800 },
          totalMonthlyPayrollINR: { type: "number", example: 75639350993.15 },
          totalMonthlyPayrollUSD: { type: "number", example: 789173638.03 },
          averageSalary: { type: "number", example: 1158687.21 },
          minSalary: { type: "number", example: 24000 },
          maxSalary: { type: "number", example: 24100000 },
          newHiresLast30Days: { type: "integer", example: 12 },
          leaversLast30Days: { type: "integer", example: 3 },
          revisionsLast30Days: { type: "integer", example: 25 },
        },
      },
      charts: {
        type: "object",
        properties: {
          monthlyPayrollTrend: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string", example: "2026-03" },
                totalDisbursed: { type: "number", example: 48940100 },
                revisionsCount: { type: "integer", example: 51 },
              },
            },
          },
          departmentDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                departmentId: { type: "string" },
                departmentName: { type: "string", example: "Engineering" },
                employeeCount: { type: "integer", example: 4683 },
                totalPayroll: { type: "number", example: 5413411200 },
              },
            },
          },
          levelDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                level: { type: "string", example: "senior" },
                employeeCount: { type: "integer", example: 2540 },
                totalPayroll: { type: "number", example: 3120000000 },
              },
            },
          },
          employmentTypeDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", example: "Full-time" },
                count: { type: "integer", example: 9200 },
              },
            },
          },
          topPayingDesignations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                jobTitle: { type: "string", example: "Principal Architect" },
                averageSalary: { type: "number", example: 15400000 },
                employeeCount: { type: "integer", example: 14 },
              },
            },
          },
          countryDistribution: {
            type: "array",
            items: {
              type: "object",
              properties: {
                countryCode: { type: "string", example: "US" },
                countryName: { type: "string", example: "United States" },
                employeeCount: { type: "integer", example: 3400 },
              },
            },
          },
        },
      },
      recentActivity: {
        type: "object",
        properties: {
          recentHires: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                employeeCode: { type: "string", example: "EMP-00102" },
                fullName: { type: "string", example: "Sarah Connor" },
                jobTitle: { type: "string", example: "DevOps Engineer" },
                departmentName: { type: "string", example: "Engineering" },
                hireDate: { type: "string", format: "date", example: "2026-03-15" },
                salary: { type: "number", example: 125000 },
              },
            },
          },
          recentSalaryRevisions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                employeeCode: { type: "string", example: "EMP-00088" },
                employeeName: { type: "string", example: "John Smith" },
                jobTitle: { type: "string", example: "Senior Engineer" },
                oldBaseSalary: { type: "number", example: 95000 },
                newPaySalary: { type: "number", example: 110000 },
                currencyCode: { type: "string", example: "USD" },
                effectiveDate: { type: "string", format: "date", example: "2026-03-01" },
                remark: { type: "string", example: "Annual Merit Increase" },
              },
            },
          },
        },
      },
    },
  },
};
