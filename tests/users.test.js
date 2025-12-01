import request from 'supertest';
import { app, __setUsers, __getUsers } from '../app.js';

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await __setUsers([
    {
      uid: 'uid_1',
      email: 'alice@example.com',
      displayName: 'Alice',
      interests: ['music'],
      friends: ['uid_2'],
    },
  ]);
});

describe('Users API', () => {
  test('creates a user', async () => {
    const res = await request(app).post('/users').send({
      uid: 'uid_2',
      email: 'bob@example.com',
      displayName: 'Bob',
      major: 'CS',
      interests: ['music', 'coding'],
    });

    expect(res.status).toBe(201);
    expect(res.body.firebase_uid).toBe('uid_2');
    const users = await __getUsers();
    expect(users.find((u) => u.firebase_uid === 'uid_2')).toBeTruthy();
  });

  test('rejects invalid interests type', async () => {
    const res = await request(app).post('/users').send({
      uid: 'bad',
      email: 'test@example.com',
      displayName: 'Test',
      interests: 'not-an-array',
    });
    expect(res.status).toBe(400);
  });

  test('gets a user by uid', async () => {
    const res = await request(app).get('/users/uid_1');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('alice@example.com');
  });

  test('updates a user', async () => {
    const res = await request(app).put('/users/uid_1').send({
      bio: 'Hello world',
      interests: ['music', 'reading'],
    });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe('Hello world');
    expect(res.body.interests).toContain('reading');
  });
});
