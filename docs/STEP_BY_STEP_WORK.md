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
- [ ] Department routes (create, list, update, delete)
- [ ] Country & Currency master data routes

### Step 5: Excel Bulk Import / Export

- [ ] Upload `.xlsx` file to import employees in bulk
- [ ] Validate rows and insert using `bulkWrite()`
- [ ] Export salary reports to Excel

### Step 6: Compensation Analytics API

- [ ] Aggregation endpoint for total payroll, avg/min/max salary
- [ ] Breakdown by department, country, and job level
- [ ] Currency conversion to USD for comparison

### Step 7: Frontend Web App

- [ ] Login screen for organization
- [ ] Employee management table (filters, search, pagination)
- [ ] Salary history modal & revision form
- [ ] Analytics dashboard with charts
- [ ] Excel upload/download buttons
