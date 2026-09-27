/**
 * Department Metrics & Aggregation Logic Domain Unit Tests
 * Follows the Arrange-Act-Assert (AAA) pattern.
 */

describe("Department Compensation Metrics Aggregator", () => {
  interface EmployeeRecord {
    id: string;
    departmentId: string;
    salary: number; // In normalized base currency (INR)
    role: string;
    level: "junior" | "mid" | "senior" | "lead" | "exec";
  }

  interface DepartmentMetrics {
    headcount: number;
    totalPayroll: number;
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    medianSalary: number;
  }

  // Domain logic: Computes department-level summary statistics
  const calculateDepartmentMetrics = (employees: EmployeeRecord[]): DepartmentMetrics => {
    if (employees.length === 0) {
      return {
        headcount: 0,
        totalPayroll: 0,
        avgSalary: 0,
        minSalary: 0,
        maxSalary: 0,
        medianSalary: 0,
      };
    }

    const headcount = employees.length;
    const salaries = employees.map((e) => e.salary).sort((a, b) => a - b);
    const totalPayroll = salaries.reduce((acc, curr) => acc + curr, 0);
    const avgSalary = Math.round((totalPayroll / headcount) * 100) / 100;
    const minSalary = salaries[0];
    const maxSalary = salaries[salaries.length - 1];

    // Median calculation
    const mid = Math.floor(salaries.length / 2);
    const medianSalary =
      salaries.length % 2 !== 0
        ? salaries[mid]
        : Math.round(((salaries[mid - 1] + salaries[mid]) / 2) * 100) / 100;

    return {
      headcount,
      totalPayroll,
      avgSalary,
      minSalary,
      maxSalary,
      medianSalary,
    };
  };

  describe("calculateDepartmentMetrics()", () => {
    it("should compute exact metrics for a populated department (AAA)", () => {
      // Arrange
      const employees: EmployeeRecord[] = [
        { id: "1", departmentId: "dept_eng", salary: 50000, role: "Dev", level: "junior" },
        { id: "2", departmentId: "dept_eng", salary: 80000, role: "Dev", level: "mid" },
        { id: "3", departmentId: "dept_eng", salary: 120000, role: "Dev", level: "senior" },
        { id: "4", departmentId: "dept_eng", salary: 150000, role: "Lead", level: "lead" },
      ];

      // Act
      const metrics = calculateDepartmentMetrics(employees);

      // Assert
      expect(metrics.headcount).toBe(4);
      expect(metrics.totalPayroll).toBe(400000);
      expect(metrics.avgSalary).toBe(100000);
      expect(metrics.minSalary).toBe(50000);
      expect(metrics.maxSalary).toBe(150000);
      expect(metrics.medianSalary).toBe(100000); // (80000 + 120000) / 2
    });

    it("should correctly handle odd number of employees for median calculation (AAA)", () => {
      // Arrange
      const employees: EmployeeRecord[] = [
        { id: "1", departmentId: "dept_sales", salary: 40000, role: "Rep", level: "junior" },
        { id: "2", departmentId: "dept_sales", salary: 60000, role: "Rep", level: "mid" },
        { id: "3", departmentId: "dept_sales", salary: 110000, role: "Mgr", level: "senior" },
      ];

      // Act
      const metrics = calculateDepartmentMetrics(employees);

      // Assert
      expect(metrics.headcount).toBe(3);
      expect(metrics.medianSalary).toBe(60000);
    });

    it("should return zeros for empty department without throwing divide-by-zero errors (AAA)", () => {
      // Arrange
      const employees: EmployeeRecord[] = [];

      // Act
      const metrics = calculateDepartmentMetrics(employees);

      // Assert
      expect(metrics.headcount).toBe(0);
      expect(metrics.totalPayroll).toBe(0);
      expect(metrics.avgSalary).toBe(0);
      expect(metrics.minSalary).toBe(0);
      expect(metrics.maxSalary).toBe(0);
      expect(metrics.medianSalary).toBe(0);
    });
  });
});
