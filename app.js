const express = require('express');
const path = require('path');

const COUNTRIES = ['US', 'IN', 'DE', 'UK', 'CA', 'AU', 'SG'];
const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Finance', 'Operations', 'Marketing'];

function createStore() {
  const employees = new Map();
  const countryIndex = new Map();
  const departmentIndex = new Map();
  const countryAgg = new Map();
  const departmentAgg = new Map();
  let nextId = 1;

  const ensureAggregate = (target, key) => {
    if (!target.has(key)) {
      target.set(key, { count: 0, totalSalary: 0, minSalary: Infinity, maxSalary: -Infinity });
    }
    return target.get(key);
  };

  const updateAggregateOnAdd = (target, key, salary) => {
    const agg = ensureAggregate(target, key);
    agg.count += 1;
    agg.totalSalary += salary;
    agg.minSalary = Math.min(agg.minSalary, salary);
    agg.maxSalary = Math.max(agg.maxSalary, salary);
  };

  const updateAggregateOnRemove = (target, key, salary, index) => {
    const agg = target.get(key);
    if (!agg) return;

    agg.count -= 1;
    agg.totalSalary -= salary;
    if (agg.count <= 0) {
      target.delete(key);
      index.delete(key);
      return;
    }

    if (salary === agg.minSalary || salary === agg.maxSalary) {
      let min = Infinity;
      let max = -Infinity;
      for (const id of index.get(key)) {
        const value = employees.get(id).salary;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
      agg.minSalary = min;
      agg.maxSalary = max;
    }
  };

  const addToIndex = (index, key, id) => {
    if (!index.has(key)) index.set(key, new Set());
    index.get(key).add(id);
  };

  const removeFromIndex = (index, key, id) => {
    const set = index.get(key);
    if (!set) return;
    set.delete(id);
    if (set.size === 0) index.delete(key);
  };

  const addEmployee = ({ name, country, department, salary }) => {
    const employee = { id: nextId++, name, country, department, salary };
    employees.set(employee.id, employee);

    addToIndex(countryIndex, country, employee.id);
    addToIndex(departmentIndex, department, employee.id);
    updateAggregateOnAdd(countryAgg, country, salary);
    updateAggregateOnAdd(departmentAgg, department, salary);

    return employee;
  };

  const removeEmployee = (id) => {
    const employee = employees.get(id);
    if (!employee) return false;

    removeFromIndex(countryIndex, employee.country, id);
    removeFromIndex(departmentIndex, employee.department, id);
    updateAggregateOnRemove(countryAgg, employee.country, employee.salary, countryIndex);
    updateAggregateOnRemove(departmentAgg, employee.department, employee.salary, departmentIndex);
    employees.delete(id);

    return true;
  };

  const updateEmployee = (id, updates) => {
    const current = employees.get(id);
    if (!current) return null;

    const merged = { ...current, ...updates };
    if (
      merged.country !== current.country ||
      merged.department !== current.department ||
      merged.salary !== current.salary
    ) {
      removeEmployee(id);
      const replacement = { id, ...merged };
      employees.set(id, replacement);

      addToIndex(countryIndex, replacement.country, id);
      addToIndex(departmentIndex, replacement.department, id);
      updateAggregateOnAdd(countryAgg, replacement.country, replacement.salary);
      updateAggregateOnAdd(departmentAgg, replacement.department, replacement.salary);

      return replacement;
    }

    employees.set(id, merged);
    return merged;
  };

  const seedEmployees = (count = 10000) => {
    for (let i = 0; i < count; i += 1) {
      const country = COUNTRIES[i % COUNTRIES.length];
      const department = DEPARTMENTS[i % DEPARTMENTS.length];
      const salary = 35000 + ((i * 173) % 135000);
      addEmployee({
        name: `Employee ${i + 1}`,
        country,
        department,
        salary,
      });
    }
  };

  const aggregateToResponse = (groupBy, map) =>
    [...map.entries()]
      .map(([key, agg]) => ({
        [groupBy]: key,
        count: agg.count,
        averageSalary: Number((agg.totalSalary / agg.count).toFixed(2)),
        minSalary: agg.minSalary,
        maxSalary: agg.maxSalary,
        totalSalary: agg.totalSalary,
      }))
      .sort((a, b) => b.averageSalary - a.averageSalary);

  const listEmployees = ({ country, department, search, limit, offset }) => {
    const normalizedSearch = (search || '').toLowerCase();

    let sourceIds = null;
    if (country && countryIndex.has(country)) sourceIds = countryIndex.get(country);
    if (department && departmentIndex.has(department)) {
      const deptIds = departmentIndex.get(department);
      sourceIds = sourceIds
        ? new Set([...sourceIds].filter((id) => deptIds.has(id)))
        : deptIds;
    }

    const records = (sourceIds ? [...sourceIds].map((id) => employees.get(id)) : [...employees.values()]).filter(
      (e) => !normalizedSearch || e.name.toLowerCase().includes(normalizedSearch)
    );

    records.sort((a, b) => a.id - b.id);

    const paged = records.slice(offset, offset + limit);
    return { total: records.length, data: paged };
  };

  return {
    addEmployee,
    updateEmployee,
    removeEmployee,
    listEmployees,
    getEmployee: (id) => employees.get(id),
    getAnalytics: () => ({
      byCountry: aggregateToResponse('country', countryAgg),
      byDepartment: aggregateToResponse('department', departmentAgg),
      totalEmployees: employees.size,
    }),
    seedEmployees,
  };
}

function parseEmployeePayload(payload) {
  const cleaned = {
    name: typeof payload.name === 'string' ? payload.name.trim() : '',
    country: typeof payload.country === 'string' ? payload.country.trim() : '',
    department: typeof payload.department === 'string' ? payload.department.trim() : '',
    salary: Number(payload.salary),
  };

  if (!cleaned.name || !cleaned.country || !cleaned.department || !Number.isFinite(cleaned.salary) || cleaned.salary <= 0) {
    return null;
  }

  return cleaned;
}

function createApp() {
  const app = express();
  const store = createStore();
  store.seedEmployees();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/employees', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const result = store.listEmployees({
      country: req.query.country,
      department: req.query.department,
      search: req.query.search,
      limit,
      offset,
    });

    res.json(result);
  });

  app.post('/api/employees', (req, res) => {
    const payload = parseEmployeePayload(req.body || {});
    if (!payload) {
      return res.status(400).json({ error: 'Invalid employee payload' });
    }

    const employee = store.addEmployee(payload);
    return res.status(201).json(employee);
  });

  app.put('/api/employees/:id', (req, res) => {
    const id = Number(req.params.id);
    const existing = store.getEmployee(id);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const candidate = {
      name: req.body.name ?? existing.name,
      country: req.body.country ?? existing.country,
      department: req.body.department ?? existing.department,
      salary: req.body.salary ?? existing.salary,
    };

    const payload = parseEmployeePayload(candidate);
    if (!payload) {
      return res.status(400).json({ error: 'Invalid employee payload' });
    }

    const updated = store.updateEmployee(id, payload);
    return res.json(updated);
  });

  app.delete('/api/employees/:id', (req, res) => {
    const id = Number(req.params.id);
    const removed = store.removeEmployee(id);
    if (!removed) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(204).send();
  });

  app.get('/api/analytics/distribution', (_req, res) => {
    res.json(store.getAnalytics());
  });

  return app;
}

module.exports = { createApp };
