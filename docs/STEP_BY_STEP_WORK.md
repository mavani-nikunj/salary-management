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
- [x] Currency sync cron job configured for daily run at 12:00 PM UTC (`0 12 * * *`)
- [x] Default Organization seeded: "Nick Dev" (`nickdev@yopmail.com`), configured in `.env`
- [x] Departments seeded from `seeds/department.json` & `seeds/employees.json` (10 departments)
- [x] Default HR user seeded: `HR_001` (`hr-nick-dev@yopmail.com`, role `HR`, jobTitle `HR Manager`)
- [x] 10,000 employees seeded from `seeds/employees.json` with batch-created initial Salary records
- [x] Seeder runner script: `npm run seed`

### Step 3: Auth & Multi-Tenancy Scoping

- [ ] Organization login & register with JWT
- [ ] Auth middleware to extract `orgId` from token and scope all queries

### Step 4: Core CRUD APIs

- [ ] Department routes (create, list, update, delete)
- [ ] Employee routes (create, list with filters/pagination, update, toggle status)
- [ ] Salary history routes (add increment, view timeline)
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
