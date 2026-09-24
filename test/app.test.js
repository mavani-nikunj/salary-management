const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../app');

test('seeded dataset supports 10,000 employees', async () => {
  const app = createApp();
  const response = await request(app).get('/api/employees?limit=1');

  assert.equal(response.status, 200);
  assert.equal(response.body.total, 10000);
  assert.equal(response.body.data.length, 1);
});

test('analytics endpoint returns country and department distributions', async () => {
  const app = createApp();
  const response = await request(app).get('/api/analytics/distribution');

  assert.equal(response.status, 200);
  assert.equal(response.body.totalEmployees, 10000);
  assert.ok(response.body.byCountry.length > 0);
  assert.ok(response.body.byDepartment.length > 0);
  assert.ok(response.body.byCountry.every((row) => typeof row.averageSalary === 'number'));
});

test('can add and update employee records through API', async () => {
  const app = createApp();

  const createRes = await request(app).post('/api/employees').send({
    name: 'Jane Doe',
    country: 'US',
    department: 'Engineering',
    salary: 150000,
  });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.name, 'Jane Doe');

  const updateRes = await request(app).put(`/api/employees/${createRes.body.id}`).send({
    salary: 175000,
    department: 'Finance',
  });

  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.salary, 175000);
  assert.equal(updateRes.body.department, 'Finance');
});
