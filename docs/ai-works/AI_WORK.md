# AI Works - How AI Works on this Project

## 1. Core Rules for AI

- **Stack**: Node.js, Express 5, TypeScript (Strict), Mongoose 9.
- **Imports**: Always use path alias `@/*` (e.g. `import { Employee } from "@/models"`).
- **Roles & Auth**: Employees have `role: "HR" | "Employee"`. Multi-tenancy scopes every employee, department, and salary operation by `orgId`.
- **API Response**: Always use `sendResponse(res, status, message, data)` from `@/utils/response`.
- **Swagger**: New routes must include `@swagger` annotations referencing schemas from `@/swagger/schemas`.
- **Currency Cron**: Daily day start 12:00 AM UTC (`0 0 * * *`) cron job (`@/cron/currency.cron`) updates `exRate` from `INR_CURRENCIES_CDN`.
- **Verification**: Always run `cmd /c "npx tsc --noEmit"` before completing a step.

---

## 2. What AI Needs to Do (Step-by-Step)

### Step 1: Database Seeders & Currency Cron (Done)

- [x] Seed countries from `seeds/country.json` (245 countries).
- [x] Fetch `INR_CURRENCIES_CDN` and seed currencies with live exchange rates relative to INR.
- [x] Seed default Organization ("Nick Dev", `nickdev@yopmail.com`).
- [x] Seed departments from `seeds/department.json` & `employees.json` (10 departments).
- [x] Seed default HR Employee (`HR_001`, `hr-nick-dev@yopmail.com`, role: `HR`).
- [x] Seed 10,000 employees from `seeds/employees.json` with batch-created initial Salary records.
- [x] Automated day start 12:00 AM UTC (`0 0 * * *`) cron job to re-sync `exRate` from CDN daily.
- [x] Standalone command: `npm run seed`.

### Step 2: Auth Middleware & Scoping (Done)

- [x] Login (`/api/auth/login`) handles both Organization & HR accounts.
- [x] JWT token carries `id`, `email`, `role`, and `orgId`.
- [x] Auth middleware (`protect`, `authorize`) attaches `req.user`, `req.userRole`, and `req.orgId`.
- [x] Self-registration endpoints (`/api/auth/register-org`, `/api/auth/register-hr`) staged for future use with guard.
- [x] Forgot/reset password endpoints (`/api/auth/forgot-password`, `/api/auth/reset-password`).
- [x] Profile & change password endpoints (`/api/auth/me`, `/api/auth/change-password`).

### Step 3: CRUD Controllers, Routes & PDF/Email Dispatch (Done)

- [x] **Employees** (`/api/employees`):
  - Full CRUD with 12+ filters (`search`, `departmentId`/`department`, `countryId`/`countryCode`, `currencyId`/`currencyCode`, `role`, `level`, `employmentType`, `status`, salary ranges, hire/leave date ranges).
  - Single employee lookup with paginated salary history (`salaryPage`, `salaryLimit`).
  - Auto-creates initial salary record on creation and logs revisions on salary updates.
  - Soft delete (status `"Inactive"`) and permanent delete options.
  - Welcome onboarding email + custom email dispatch (`/api/employees/:id/send-email`) with automatic salary slip PDF attachment.
- [x] **Salaries** (`/api/salaries`):
  - Standalone revision ledger CRUD, employee profile auto-synchronization, and date collision guards.
  - In-memory PDF payslip generation and streaming (`GET /api/salaries/:id/pdf`).
  - Direct salary slip dispatch (`POST /api/salaries/:id/send-email`).
- [x] **Departments** (`/api/departments`):
  - CRUD operations with active employee headcount aggregation, duplicate name validation, and safe delete guards.
- [x] **Countries & Currencies** (`/api/countries`, `/api/currencies`):
  - Master data lookup, live exchange rates, ISO code search, and dependency verification.

### Step 4: Excel & CSV Export (Done - Correction: Export Only)

- [x] Multi-sheet `.xlsx` export (`GET /api/reports/export/excel`): Employee Register, Department Summary, Country Distribution.
- [x] Lightweight `.csv` export (`GET /api/reports/export/csv`).

### Step 5: Compensation Analytics & Dashboard Engine (Done)

- [x] **Executive Dashboard** (`/api/dashboard`, `/api/dashboard/metrics`):
  - 13 key performance indicators (headcount, payroll, 30-day velocity).
  - 6 distribution charts (monthly trends, department, level, employment type, top paying roles, country).
  - Live activity feeds (latest 5 hires & latest 5 salary revisions).
- [x] **Reports Engine** (`/api/reports/overview`, `/api/reports/departments`, `/api/reports/payroll-history`):
  - Multi-pipeline aggregations with real-time currency conversions to INR and USD.

---

## 3. How AI Handles Errors

- **Duplicate Key (`E11000`)**: Return 400 with a friendly message (e.g., "Employee code already exists in this organization").
- **Not Found**: Return 404 with a specific message (e.g., "Employee not found").
- **Validation Error**: Return 422 with the list of missing or invalid fields.
