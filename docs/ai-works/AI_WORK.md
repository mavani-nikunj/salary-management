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

### Step 2: Auth Middleware & Scoping

- Verify JWT token and attach `req.orgId` & `req.userRole`.
- Block any unauthorized requests or requests without valid `orgId`.

### Step 3: CRUD Controllers & Routes

- **Departments**: Create, list, edit, delete (scoped to `orgId`, unique name check).
- **Employees**: Create (auto-create first salary record), list with search/filter, update, deactivate.
- **Salaries**: Add new salary revision for employee, list chronological history.

### Step 4: Excel Bulk Import / Export

- Parse uploaded `.xlsx` file using `xlsx` library.
- Validate employee codes & department IDs before inserting.
- Use `bulkWrite()` for fast database insertion.

### Step 5: Analytics API

- Write MongoDB aggregation pipeline:
  - Normalize salaries to USD using `salary * exRate`.
  - Calculate total payroll, average, min, max.
  - Group by department, country, and job level (`junior`, `mid`, `senior`, `lead`, `manager`).

---

## 3. How AI Handles Errors

- **Duplicate Key (`E11000`)**: Return 400 with a friendly message (e.g., "Employee code already exists in this organization").
- **Not Found**: Return 404 with a specific message (e.g., "Employee not found").
- **Validation Error**: Return 422 with the list of missing or invalid fields.
