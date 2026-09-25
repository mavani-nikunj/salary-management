# Project Work - Step-by-Step

### Step 1: Database Models (Done)
- [x] Set up Mongoose models in `backend/src/models/`:
  - `Organization` (name, email, passwordHash, status)
  - `Country` (name, code)
  - `Currency` (countryId, code, name, exRate) -> Compound unique: `[countryId, code]`
  - `Department` (orgId, name, status) -> Compound unique: `[orgId, name]`
  - `Employee` (orgId, employeeCode, names, email, departmentId, level, countryId, currencyId, salary, hireDate, employmentType, status) -> Compound unique: `[orgId, employeeCode]`
  - `Salary` (employeeId, baseSalary, paySalary, currencyId, effectiveDate, remark) -> Compound unique: `[employeeId, effectiveDate]`

### Step 2: Seeders & Initial Data
- [ ] Create seed script to populate:
  - Countries & Currencies (with exchange rates)
  - ACME Organization & Departments
  - Sample employees & initial salary entries

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
