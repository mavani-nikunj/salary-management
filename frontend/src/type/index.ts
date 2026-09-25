// ==========================================
// PAYPULSE - GLOBAL TYPE DEFINITIONS
// ==========================================

export type Role = "Organization" | "HR" | "Employee";

export type Status = "Active" | "Inactive";

export type EmployeeRole = "HR" | "Employee";

export type EmployeeLevel = "junior" | "mid" | "senior" | "lead" | "manager";

export type EmploymentType = "Full-time" | "Part-time" | "Contract";

export type SortOrder = "asc" | "desc";

// ------------------------------------------
// 1. CORE DOMAIN ENTITIES
// ------------------------------------------

export interface Organization {
  id: string;
  name: string;
  email: string;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  orgId?: string;
  name: string;
  status: Status;
  employeeCount?: number;
  totalSalaryBudget?: number;
  avgSalary?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Currency {
  id: string;
  countryId?: string | Country;
  code: string;
  name: string;
  exRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  departmentId: string | Department;
  role: EmployeeRole;
  level: EmployeeLevel;
  countryId: string | Country;
  currencyId: string | Currency;
  salary: number;
  hireDate: string;
  employmentType: EmploymentType;
  leaveDate?: string | null;
  status: Status;
  orgId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Salary {
  id: string;
  employeeId: string | Employee;
  baseSalary: number;
  paySalary: number;
  currencyId: string | Currency;
  effectiveDate: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------
// 2. AUTHENTICATION & USER PROFILE
// ------------------------------------------

export interface User {
  id: string;
  email: string;
  role: Role;
  orgId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  employeeCode?: string;
  jobTitle?: string;
  status?: Status;
}

export interface AuthSession {
  user: User;
  token?: string;
  role?: Role;
  orgId?: string;
  expires?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

// ------------------------------------------
// 3. API RESPONSE WRAPPERS
// ------------------------------------------

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  code: number;
  message: string;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

// ------------------------------------------
// 4. FILTER & QUERY PARAMS
// ------------------------------------------

export interface EmployeeFilterParams {
  search?: string;
  departmentId?: string;
  department?: string;
  countryId?: string;
  countryCode?: string;
  currencyId?: string;
  currencyCode?: string;
  role?: EmployeeRole;
  level?: EmployeeLevel;
  employmentType?: EmploymentType;
  status?: Status;
  minSalary?: number;
  maxSalary?: number;
  hireDateFrom?: string;
  hireDateTo?: string;
  leaveDateFrom?: string;
  leaveDateTo?: string;
  hasLeft?: boolean;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface SalaryFilterParams {
  search?: string;
  employeeId?: string;
  departmentId?: string;
  currencyId?: string;
  minSalary?: number;
  maxSalary?: number;
  effectiveDateFrom?: string;
  effectiveDateTo?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface DepartmentFilterParams {
  search?: string;
  status?: Status;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// ------------------------------------------
// 5. DASHBOARD & ANALYTICS
// ------------------------------------------

export interface DashboardKPIs {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalDepartments: number;
  totalCountries: number;
  totalCurrencies: number;
  totalMonthlyPayrollUSD: number;
  totalMonthlyPayrollINR: number;
  avgSalaryUSD: number;
  newHiresLast30Days: number;
  leaversLast30Days: number;
  salaryRevisionsLast30Days: number;
  activeEmployeePercentage: number;
}

export interface DashboardCharts {
  departmentDistribution: Array<{
    name: string;
    count: number;
    totalSalaryUSD: number;
  }>;
  levelDistribution: Array<{
    level: EmployeeLevel;
    count: number;
    avgSalaryUSD: number;
  }>;
  employmentTypeDistribution: Array<{
    type: EmploymentType;
    count: number;
  }>;
  countryDistribution: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  monthlyDisbursementTrend: Array<{
    month: string;
    revisionCount: number;
    totalDisbursedUSD: number;
  }>;
  topPayingRoles: Array<{
    jobTitle: string;
    avgSalaryUSD: number;
    count: number;
  }>;
}

export interface DashboardData {
  metrics: DashboardKPIs;
  charts: DashboardCharts;
  recentHires: Employee[];
  recentSalaryRevisions: Salary[];
}
