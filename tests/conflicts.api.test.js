import request from 'supertest';
import { app, __setEvents } from '../app.js';

const iso = (d) => new Date(d).toISOString();

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await __setEvents([
    { id: 'a', title: 'A', start: iso('2024-01-01T10:00:00Z'), end: iso('2024-01-01T11:00:00Z') },
    { id: 'b', title: 'B', start: iso('2024-01-01T12:00:00Z'), end: iso('2024-01-01T13:00:00Z') },
  ]);
});

describe('GET /events conflicts shape', () => {
  test('still returns array when no range provided', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
