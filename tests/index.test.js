import request from 'supertest';
import app from"../index.js";

describe('Express App Routes', () => {
  test('GET / should return Team Pending Status message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Team Pending Status');
  });

  test('GET /bryan should return Bryan message', async () => {
    const res = await request(app).get('/bryan');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Bryan');
  });

  test('GET /emily should return Emily message', async () => {
    const res = await request(app).get('/emily');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Emily');
  });

  test('GET /erik should return Erik message', async () => {
    const res = await request(app).get('/erik');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Erik');
  });
});
