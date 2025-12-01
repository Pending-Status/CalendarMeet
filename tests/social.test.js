import request from 'supertest';
import { app, __setUsers, __getUsers } from '../app.js';

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await __setUsers([
    { uid: 'u1', email: 'a@test.com', displayName: 'A', interests: ['music', 'cs'], friends: [] },
    { uid: 'u2', email: 'b@test.com', displayName: 'B', interests: ['music'], friends: [] },
    { uid: 'u3', email: 'c@test.com', displayName: 'C', interests: ['art'], friends: [] },
  ]);
});

describe('Social endpoints', () => {
  test('add and remove friend', async () => {
    const add = await request(app).post('/users/u1/friends').send({ friendUid: 'u2' });
    expect(add.status).toBe(200);
    expect(add.body.friends).toContain('u2');

    const del = await request(app).delete('/users/u1/friends/u2');
    expect(del.status).toBe(204);
    const users = await __getUsers();
    const u1 = users.find((u) => u.firebase_uid === 'u1');
    expect(u1.friends).not.toContain('u2');
  });

  test('recommendations exclude existing friends and sort by overlap', async () => {
    await request(app).post('/users/u1/friends').send({ friendUid: 'u2' });
    const res = await request(app).get('/users/u1/recommendations');
    expect(res.status).toBe(200);
    const ids = res.body.map((u) => u.firebase_uid);
    expect(ids).not.toContain('u2'); // already friend
    expect(ids).toContain('u3');
  });
});
