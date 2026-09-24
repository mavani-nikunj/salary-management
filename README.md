# salary-management-

High-performance, web-based employee salary management system for ACME HR teams.

## Features

- Pre-seeded dataset for **10,000 employees**
- Salary record management via API (create, update, delete, list/filter)
- Compensation distribution analytics by:
  - Country
  - Department
- Lightweight browser UI for HR workflows and quick analysis
- In-memory indexed/aggregated data structures for fast reads and analytics

## Quick Start

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## Test

```bash
npm test
```

## API Overview

- `GET /api/employees?search=&country=&department=&limit=&offset=`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/analytics/distribution`
