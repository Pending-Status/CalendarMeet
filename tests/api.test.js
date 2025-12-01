import request from 'supertest';
import { app, __setEvents, __getEvents } from '../app.js';

const iso = (d) => new Date(d).toISOString();

beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    await __setEvents([
        { id: 'a', title: 'A', start: iso('2024-01-01T10:00:00Z'), end: iso('2024-01-01T11:00:00Z') },
        { id: 'b', title: 'B', start: iso('2024-01-02T10:00:00Z') },
    ]);
});


describe('GET /health', () => {
    test('returns ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });
});


describe('GET /events', () => {
    test('returns all when no range', async () => {
        const res = await request(app).get('/events');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
    });
    test('filters by range', async () => {
        const res = await request(app)
            .get('/events')
            .query({ start: iso('2024-01-01T00:00:00Z'), end: iso('2024-01-01T23:59:59Z') });
        expect(res.status).toBe(200);
        expect(res.body.map((e) => e.id)).toEqual(['a']);
    });
    test('400 on invalid dates', async () => {
        const res = await request(app).get('/events').query({ start: 'bad', end: 'also-bad' });
        expect(res.status).toBe(400);
    });
});


describe('POST /events', () => {
test('creates an event', async () => {
        const res = await request(app).post('/events').send({ title: 'C', start: iso('2024-01-03T10:00:00Z'), type: 'study', recurrence: { freq: 'weekly' } });
        expect(res.status).toBe(201);
        expect(res.body.id).toBeTruthy();
        expect((await __getEvents()).length).toBe(3);
        expect(res.body.type).toBe('study');
});
    test('validates required fields', async () => {
    const res = await request(app).post('/events').send({ title: '' });
    expect(res.status).toBe(400);
});
});


describe('PUT /events/:id', () => {
test('updates fields', async () => {
    const res = await request(app).put('/events/a').send({ title: 'A2' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('A2');
});
test('404 on missing', async () => {
    const res = await request(app).put('/events/missing').send({ title: 'x' });
    expect(res.status).toBe(404);
});
test('validates dates', async () => {
    const res = await request(app).put('/events/a').send({ start: 'bad' });
    expect(res.status).toBe(400);
});
});


describe('POST /events/:id/move', () => {
test('moves an event', async () => {
    const res = await request(app)
    .post('/events/a/move')
    .send({ start: iso('2024-01-01T12:00:00Z'), end: iso('2024-01-01T13:00:00Z') });
    expect(res.status).toBe(200);
    expect(res.body.start).toBe(iso('2024-01-01T12:00:00.000Z'));
});
test('404 on missing', async () => {
    const res = await request(app).post('/events/missing/move').send({ start: iso('2024-01-01T12:00:00Z') });
    expect(res.status).toBe(404);
});
test('400 on invalid', async () => {
    const res = await request(app).post('/events/a/move').send({ start: 'bad' });
    expect(res.status).toBe(400);
});
});


describe('DELETE /events/:id', () => {
test('deletes', async () => {
    const res = await request(app).delete('/events/a');
    expect(res.status).toBe(204);
    const events = await __getEvents();
    expect(events.find((e) => e.id === 'a')).toBeUndefined();
});
test('404 on missing', async () => {
    const res = await request(app).delete('/events/missing');
    expect(res.status).toBe(404);
});
});
