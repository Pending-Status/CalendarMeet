import request from 'supertest';
import app from "../index.js"

describe("Extra Express Route Tests", () => {

  test('GET / should return greeting with "Hello World"', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Hello World/);
  });

  test('GET /bryan should return Bryan message mentioning basketball and coding', async () => {
    const res = await request(app).get('/bryan');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Bryan/i);
    expect(res.text).toMatch(/basketball/i);
    expect(res.text).toMatch(/coding/i);
  });

  test('GET /emily should return Emily message mentioning game development and art', async () => {
    const res = await request(app).get('/emily');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Emily/i);
    expect(res.text).toMatch(/game development/i);
    expect(res.text).toMatch(/art/i);
  });

  test('GET /erik should return Erik message mentioning gaming and cybersecurity', async () => {
    const res = await request(app).get('/erik');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Erik/i);
    expect(res.text).toMatch(/gaming/i);
    expect(res.text).toMatch(/cybersecurity/i);
  });

  test('GET /invalidRoute should return 404 Not Found', async () => {
    const res = await request(app).get('/invalidRoute');
    expect(res.statusCode).toBe(404);
  });

  test('All routes should return text/html content type', async () => {
    const routes = ['/', '/bryan', '/emily', '/erik'];
    for (const route of routes) {
      const res = await request(app).get(route);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    }
  });

});
