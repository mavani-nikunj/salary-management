# Project Work - Step-by-Step

### Step 1: Database Models & Swagger Setup (Done)

- [x] Set up Mongoose models in `backend/src/models/`:
  - `Organization` (name, email, passwordHash, status)
  - `Country` (name, code)
  - `Currency` (countryId, code, name, exRate) -> Compound unique: `[countryId, code]`
  - `Department` (orgId, name, status) -> Compound unique: `[orgId, name]`
  - `Employee` (orgId, employeeCode, names, email, departmentId, role: ["HR", "Employee"], level, countryId, currencyId, salary, hireDate, employmentType, status) -> Compound unique: `[orgId, employeeCode]`
  - `Salary` (employeeId, baseSalary, paySalary, currencyId, effectiveDate, remark) -> Compound unique: `[employeeId, effectiveDate]`
- [x] Modular Swagger setup in `backend/src/swagger/`:
  - `swagger.config.ts`, `schemas/` (OpenAPI schemas for all models), `/api-docs` & `/api-docs.json` endpoints

### Step 2: Seeders, Currency Cron & Initial Data (Done)

- [x] Countries seeded from `seeds/country.json` (245 countries)
- [x] Currencies seeded with exchange rates matching `currency_code` from `INR_CURRENCIES_CDN` (239 currencies)
- [x] Currency sync cron job configured for daily run at day start 12:00 AM UTC (`0 0 * * *`)
- [x] Default Organization seeded: "Nick Dev" (`nickdev@yopmail.com`), configured in `.env`
- [x] Departments seeded from `seeds/department.json` & `seeds/employees.json` (10 departments)
- [x] Default HR user seeded: `HR_001` (`hr-nick-dev@yopmail.com`, role `HR`, jobTitle `HR Manager`)
- [x] 10,000 employees seeded from `seeds/employees.json` with batch-created initial Salary records
- [x] Seeder runner script: `npm run seed`

### Step 3: Auth & Multi-Tenancy Scoping (Done)

- [x] Login endpoint (`POST /api/auth/login`) supporting both Organization and HR/Employee accounts
- [x] JWT token issuing with `id`, `email`, `role`, and multi-tenant `orgId`
- [x] Staged registration endpoints for future use (`POST /api/auth/register-org`, `POST /api/auth/register-hr`) with self-registration guard
- [x] Forgot password (`POST /api/auth/forgot-password`) & Reset password (`POST /api/auth/reset-password`) with secure token expiration
- [x] Current user profile (`GET /api/auth/me`) & password change (`POST /api/auth/change-password`)
- [x] Auth middleware (`protect`, `authorize`) extracting `req.orgId` & `req.userRole`

### Step 4: Core CRUD APIs & Email Integration

- [x] Employee CRUD (`/api/employees`):
  - Multi-faceted filters: `search`, `departmentId`/`department`, `countryId`/`countryCode`, `currencyId`/`currencyCode`, `role`, `level`, `employmentType`, `status`, `minSalary`/`maxSalary`, `hireDateFrom`/`hireDateTo`, `leaveDateFrom`/`leaveDateTo`, `hasLeft`
  - Sorting (`sortBy`, `sortOrder`) & pagination (`page`, `limit`)
  - Single employee lookup with paginated salary history (`GET /api/employees/:id?salaryPage=1&salaryLimit=10`)
  - Auto-created initial `Salary` record upon creation
  - Automated salary revision ledger logging upon salary change
  - Soft deactivation (`status = Inactive`) and permanent deletion (`?permanent=true`)
- [x] Email Dispatch & PDF Salary Slip integration:
  - Automated welcome onboarding email upon employee registration
  - Custom email dispatch endpoint (`POST /api/employees/:id/send-email`)
  - Official Salary Slip PDF generation (PDFKit) and attachment dispatch (`salaryId` selection)
- [x] Salary CRUD & Revision Ledger (`/api/salaries`):
  - List & filter revisions (`GET /api/salaries`): search, employeeId, departmentId, currencyId, salary range, effectiveDate range, sorting, pagination
  - Single salary details (`GET /api/salaries/:id`) with populated employee & currency
  - Create revision (`POST /api/salaries`): unique date check, auto employee profile synchronization, optional instant PDF email
  - Update revision (`PUT /api/salaries/:id`): date collision guard, employee profile resync
  - Delete revision (`DELETE /api/salaries/:id`): auto-syncs employee salary with remaining latest record
  - PDF stream & download (`GET /api/salaries/:id/pdf`): direct PDF render
  - Direct slip email (`POST /api/salaries/:id/send-email`): zero-payload direct payslip email dispatch
- [x] Department routes (`/api/departments`):
  - List departments with active employee headcounts & search (`GET /api/departments`)
  - Department details with total salary expense & average salary (`GET /api/departments/:id`)
  - Create department with duplicate guard (`POST /api/departments`)
  - Update department name and status (`PUT /api/departments/:id`)
  - Delete department with employee assignment protection (`DELETE /api/departments/:id`)
- [x] Country & Currency master data routes (`/api/countries`, `/api/currencies`):
  - List & search countries (`GET /api/countries`), get by ID or 2-letter ISO code (`GET /api/countries/:id`), create, update, delete
  - List & search currencies with live exchange rates (`GET /api/currencies`), get by ID or code (`GET /api/currencies/:id`), create, update, delete

### Step 5: Excel & CSV Export (Done - Correction: Export Only)

- [x] Export salary reports to Excel (`GET /api/reports/export/excel`):
  - Multi-sheet workbook: Employee Register, Department Summary, Country Distribution
  - Filterable by department, country, status, salary range, and level
- [x] Export employee payroll ledger to CSV (`GET /api/reports/export/csv`)

### Step 6: Compensation Analytics API (Done)

- [x] Aggregation endpoint for total payroll, avg/min/max salary (`GET /api/reports/overview`):
  - Headcount metrics (total, active, inactive, departments)
  - Currency conversion to INR and USD using live exchange rates
  - Multi-dimensional breakdown: department, level, employment type, currency, top countries
- [x] Department compensation report (`GET /api/reports/departments`):
  - Active headcount, total budget, average/min/max salary, level distributions
- [x] Historical payroll trend report (`GET /api/reports/payroll-history`):
  - Monthly revision counts and disbursement trends over time
- [x] Consolidated Executive Dashboard API (`GET /api/dashboard` & `GET /api/dashboard/metrics`):
  - 13 Key Performance Indicators (KPIs) including 30-day new hires, leavers, and revision velocity
  - 6 Real-time visual chart datasets (monthly trend, department distribution, level distribution, employment type, top paying roles, country distribution)
  - Live activity feeds (latest 5 employee hires & latest 5 salary revisions)

### Step 7: Frontend Web App (Done)

- [x] Login screen for organization
- [x] Employee management table (filters, search, pagination)
- [x] Salary history modal & revision form
- [x] Analytics dashboard with charts
- [x] Excel export & CSV download buttons
