import request from 'supertest';
import { app, __setEvents, __setUsers, __setAttendees, __getAttendees } from '../app.js';

const iso = (d) => new Date(d).toISOString();

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await __setEvents([
    { id: 'evt1', title: 'Event 1', start: iso('2024-01-01T10:00:00Z') },
  ]);
  await __setUsers([
    { uid: 'u1', email: 'a@test.com', displayName: 'A' },
    { uid: 'u2', email: 'b@test.com', displayName: 'B' },
  ]);
  await __setAttendees([]);
});

describe('RSVP endpoints', () => {
  test('creates or updates RSVP', async () => {
    const res = await request(app).post('/events/evt1/rsvp').send({
      uid: 'u1',
      status: 'going',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('going');

    // update
    const res2 = await request(app).post('/events/evt1/rsvp').send({
      uid: 'u1',
      status: 'maybe',
    });
    expect(res2.status).toBe(201);
    expect(res2.body.status).toBe('maybe');
  });

  test('rejects invalid status', async () => {
    const res = await request(app).post('/events/evt1/rsvp').send({
      uid: 'u1',
      status: 'bad',
    });
    expect(res.status).toBe(400);
  });

  test('lists attendees', async () => {
    await request(app).post('/events/evt1/rsvp').send({ uid: 'u1', status: 'going' });
    await request(app).post('/events/evt1/rsvp').send({ uid: 'u2', status: 'maybe' });

    const res = await request(app).get('/events/evt1/attendees');
    expect(res.status).toBe(200);
    expect(res.body.map((a) => a.user_uid)).toEqual(expect.arrayContaining(['u1', 'u2']));
  });

  test('deletes RSVP', async () => {
    await request(app).post('/events/evt1/rsvp').send({ uid: 'u1', status: 'going' });
    const del = await request(app).delete('/events/evt1/rsvp/u1');
    expect(del.status).toBe(204);
    const attendees = await __getAttendees();
    expect(attendees.find((a) => a.user_uid === 'u1')).toBeUndefined();
  });
});
