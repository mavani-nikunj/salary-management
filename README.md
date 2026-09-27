# ACME Salary Management System

A high-performance, web-based employee salary management system built for **ACME Organization** (10,000+ employees) to replace tedious spreadsheet/Excel workflows. Enables HR managers to manage multi-country, multi-currency compensation, maintain revision ledgers, and execute real-time analytics.

---

## Tech Stack

- **Backend**: Node.js, Express 5, TypeScript (Strict Mode)
- **Database & ORM**: MongoDB, Mongoose 9
- **API Documentation**: Swagger / OpenAPI 3.0 (`swagger-jsdoc`, `swagger-ui-express`)
- **Authentication**: JWT, bcryptjs

---

## Current Progress & Completed Setup

### 1. Database Models (`backend/src/models/`)

All core entities and multi-tenant compound unique indexes are configured:

| Model            | Collection      | Key Fields & Indexes                                                                                 |
| :--------------- | :-------------- | :--------------------------------------------------------------------------------------------------- |
| **Organization** | `organizations` | Root tenant entity, status enum (`Active`, `Inactive`), unique `email`                               |
| **Country**      | `countries`     | Master registry, unique `name`, unique `code`                                                        |
| **Currency**     | `currencies`    | Linked to Country, `exRate` (min 0.0001), compound unique: `[countryId, code]`                       |
| **Department**   | `departments`   | Scoped to Org, compound unique: `[orgId, name]`                                                      |
| **Employee**     | `employees`     | Scoped to Org, compound unique: `[orgId, employeeCode]`, role (`HR`, `Employee`), level & type enums |
| **Salary**       | `salaries`      | Scoped to Employee, compound unique: `[employeeId, effectiveDate]`                                   |

### 2. Modular Swagger Documentation (`backend/src/swagger/`)

- **Swagger UI**: [`http://localhost:5022/api-docs`](http://localhost:5022/api-docs)
- **Raw JSON Spec**: [`http://localhost:5022/api-docs.json`](http://localhost:5022/api-docs.json)
- Modular schema definitions pre-loaded under OpenAPI components for all models.

### 3. Project Documentation

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): Product framing, deliberate scope exclusions, architecture diagrams, trade-offs, and performance design.
- [docs/STEP_BY_STEP_WORK.md](docs/STEP_BY_STEP_WORK.md): Step-by-step implementation checklist.
- [docs/ai-works/AI_WORK.md](docs/ai-works/AI_WORK.md): Operational rules and task steps for AI development.

---

## Getting Started

### 1. Environment Configuration

Ensure your `backend/.env` file is set up:

```env
PORT=5022
NODE_ENV=development
DB_URL="mongodb://localhost:27017/salary-management"
JWT_SECRET="your-jwt-secret"
```

### 2. Run Backend Locally

```bash
cd backend
npm install
npm run dev
```

### 3. Database Seeding & Cron Job

Populate 245 countries, live currencies, default organization, departments, default HR user, and 10,000 employees:

```bash
npm run seed
```

- **Currency Cron**: Daily at day start 12:00 AM UTC (`0 0 * * *`), automatically syncs exchange rates against INR from CDN.
- **Default Org**: "Nick Dev" (`nickdev@yopmail.com` / `Admin@123`)
- **Default HR**: `HR_001` (`hr-nick-dev@yopmail.com` / `Admin@123`, role: `HR`)

### 4. Run Unit Test Suite

Fast, deterministic domain unit tests covering compensation conversions, validation rules, state transitions, salary revisions, multi-tenancy isolation, and department metrics:

```bash
cd backend
npm test
```

*Executes 33 tests across 6 test suites in ~1.5 seconds.*

### 5. Verify Endpoints

- **Health Check**: `GET http://localhost:5022/health`
- **API Documentation**: `GET http://localhost:5022/api-docs`

---

## Implementation Roadmap

- [x] **Step 1**: Core Database Models & Modular Swagger Setup
- [x] **Step 2**: Database Seeders, Live Currency Cron & 10k Records Initial Data
- [x] **Step 3**: Multi-Tenant JWT Auth Middleware & Scoping (Login, Forgot/Reset Password, Staged Registration)
- [x] **Step 4**: Core Employee, Salary, Department, Country & Currency CRUD & Master Data APIs
- [x] **Step 5**: Excel & CSV Payroll Export (`.xlsx` multi-sheet workbook & `.csv` exports) *(Correction: Export Only)*
- [x] **Step 6**: Compensation Analytics & Consolidated Dashboard Engine (`/api/reports` & `/api/dashboard`)
- [x] **Step 7**: Frontend Management Web Application (Next.js 16, React 19, HeroUI, Recharts, Tailwind CSS v4)
