import request from 'supertest';
import { app, __setEvents, __setUsers, __setAttendees } from '../app.js';

const iso = (d) => new Date(d).toISOString();

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await __setEvents([
    { id: 'evt1', title: 'A', start: iso('2024-01-01T10:00:00Z') },
    { id: 'evt2', title: 'B', start: iso('2024-01-02T10:00:00Z') },
  ]);
  await __setUsers([
    { uid: 'u1', email: 'a@test.com', displayName: 'A' },
    { uid: 'u2', email: 'b@test.com', displayName: 'B' },
  ]);
  await __setAttendees([
    { event_id: 'evt1', uid: 'u1', status: 'going' },
    { event_id: 'evt1', uid: 'u2', status: 'maybe' },
  ]);
});

describe('Analytics summary', () => {
  test('returns counts', async () => {
    const res = await request(app).get('/analytics/summary');
    expect(res.status).toBe(200);
    expect(res.body.totalEvents).toBe(2);
    expect(res.body.totalUsers).toBe(2);
    expect(res.body.totalRsvps).toBe(2);
  });
});
