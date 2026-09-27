export interface User {
  id: string;
  email: string;
  role: "Organization" | "HR" | "Employee";
  orgId: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface Country {
  _id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Currency {
  _id: string;
  countryId: string | Country;
  code: string;
  name: string;
  exRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  _id: string;
  orgId: string;
  name: string;
  status: "Active" | "Inactive";
  employeeCount?: number;
  activeEmployees?: number;
  totalEmployees?: number;
  totalSalaryExpenseINR?: number;
  avgSalaryINR?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  _id: string;
  orgId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  jobTitle?: string;
  email: string;
  departmentId: Department | string;
  role: "HR" | "Employee";
  level: "Junior" | "Mid" | "Senior" | "Lead" | "Executive" | "manager" | "junior" | "mid" | "senior" | "lead";
  countryId: Country | string;
  currencyId: Currency | string;
  salary: number;
  hireDate: string;
  leaveDate?: string | null;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Intern";
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface SalaryRevision {
  _id: string;
  employeeId: Employee | string;
  employeeCode?: string;
  employeeName?: string;
  baseSalary: number;
  paySalary: number;
  currencyId: Currency | string;
  currencyCode?: string;
  effectiveDate: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardKPIs {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalMonthlyPayrollNominal?: number;
  totalMonthlyPayrollINR: number;
  totalMonthlyPayrollUSD: number;
  averageSalary?: number;
  avgSalaryINR?: number;
  avgSalaryUSD?: number;
  minSalary?: number;
  maxSalary?: number;
  minSalaryINR?: number;
  maxSalaryINR?: number;
  newHiresLast30Days?: number;
  leaversLast30Days?: number;
  revisionsLast30Days?: number;
  newHires30d?: number;
  leavers30d?: number;
  revisions30d?: number;
  totalDepartments?: number;
  activeDepartments?: number;
}

export interface DashboardCharts {
  monthlyPayrollTrend?: Array<{
    month: string;
    totalDisbursed: number;
    revisionsCount: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    totalPayrollINR: number;
    totalPayrollUSD: number;
    count: number;
  }>;
  departmentDistribution?: Array<{
    departmentName?: string;
    department?: string;
    employeeCount?: number;
    count?: number;
    totalPayroll?: number;
    totalSalaryINR?: number;
  }>;
  levelDistribution?: Array<{
    level: string;
    employeeCount?: number;
    count?: number;
    totalPayroll?: number;
    avgSalaryINR?: number;
  }>;
  employmentTypeDistribution?: Array<{
    type: string;
    count: number;
  }>;
  topPayingDesignations?: Array<{
    jobTitle: string;
    averageSalary: number;
    employeeCount: number;
  }>;
  topPayingRoles?: Array<{
    department: string;
    level: string;
    avgSalaryINR: number;
  }>;
  countryDistribution?: Array<{
    countryName?: string;
    countryCode?: string;
    country?: string;
    employeeCount?: number;
    count?: number;
    totalSalaryINR?: number;
  }>;
}

export interface DashboardData {
  kpis?: DashboardKPIs;
  kpi?: DashboardKPIs;
  charts: DashboardCharts;
  recentActivity: {
    recentHires: Array<{
      _id: string;
      employeeCode: string;
      fullName?: string;
      firstName?: string;
      lastName?: string;
      departmentName?: string;
      department?: { name: string };
      hireDate: string;
      salary?: number;
    }>;
    recentSalaryRevisions?: Array<{
      _id: string;
      employeeCode: string;
      employeeName?: string;
      effectiveDate: string;
      paySalary: number;
      currencyCode?: string;
      remark?: string;
    }>;
    recentRevisions?: Array<any>;
  };
}
