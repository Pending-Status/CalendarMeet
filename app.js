import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { nanoid } from 'nanoid';

// --- Helpers ---
export function parseISO(s) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
}
export function isOverlapping(aStart, aEnd, bStart, bEnd) {
    const aS = aStart.getTime();
    const aE = (aEnd ?? aStart).getTime();
    const bS = bStart.getTime();
    const bE = (bEnd ?? bStart).getTime();
    return aS <= bE && bS <= aE;
}


// In-memory store + a way for tests to reset it
// replace later with postgres database
let EVENTS = [
{
    id: 'seed-1',
    title: 'Kickoff',
    start: new Date(Date.now() + 3600_000).toISOString(),
    end: new Date(Date.now() + 7200_000).toISOString(),
    allDay: false,
},
];
export function __setEvents(next) { EVENTS = Array.isArray(next) ? next : []; }
export function __getEvents() { return EVENTS; }

export const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});


// List events
app.get('/events', (req, res) => {
    const { start, end } = req.query;
    if (start && end) {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Invalid start or end ISO date' });
        }

    const windowed = EVENTS.filter(evt => {
        const eStart = parseISO(evt.start);
        const eEnd = evt.end ? parseISO(evt.end) : null;
        if (!eStart) return false;
        return isOverlapping(eStart, eEnd, startDate, endDate);
        });
    return res.json(windowed);
    }

    res.json(EVENTS);
});


// Create
app.post('/events', (req, res) => {
    const { title, start, end, allDay = false, extendedProps = {} } = req.body || {};
    if (!title || !start) return res.status(400).json({ error: 'title and start are required' });
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;
    if (!startDate || (end && !endDate)) return res.status(400).json({ error: 'start/end must be valid ISO strings' });


    const evt = {
        id: nanoid(),
        title,
        start: startDate.toISOString(),
        ...(endDate ? { end: endDate.toISOString() } : {}),
        allDay: Boolean(allDay),
        extendedProps: typeof extendedProps === 'object' ? extendedProps : {},
    };
    EVENTS.push(evt);
    res.status(201).json(evt);
});


// Update
app.put('/events/:id', (req, res) => {
    const { id } = req.params;
    const idx = EVENTS.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });


    const { title, start, end, allDay, extendedProps } = req.body || {};
    const patch = {};
    if (title !== undefined) patch.title = title;
    if (start !== undefined) {
        const d = parseISO(start);
        if (!d) return res.status(400).json({ error: 'Invalid start' });
        patch.start = d.toISOString();
    }
    if (end !== undefined) {
        if (end === null) patch.end = undefined;
        else {
            const d = parseISO(end);
            if (!d) return res.status(400).json({ error: 'Invalid end' });
            patch.end = d.toISOString();
        }
    }
    if (allDay !== undefined) patch.allDay = Boolean(allDay);
    if (extendedProps !== undefined) {
        if (typeof extendedProps !== 'object') return res.status(400).json({ error: 'extendedProps must be object' });
        patch.extendedProps = extendedProps;
    }


    EVENTS[idx] = { ...EVENTS[idx], ...patch };
    res.json(EVENTS[idx]);
});

// Delete event
app.delete('/events/:id', (req, res) => {
const { id } = req.params;
const before = EVENTS.length;
EVENTS = EVENTS.filter(e => e.id !== id);
if (EVENTS.length === before) return res.status(404).json({ error: 'Not found' });
res.status(204).send();
});


// Move/resize
app.post('/events/:id/move', (req, res) => {
    const { id } = req.params;
    const { start, end } = req.body || {};
    const idx = EVENTS.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const s = parseISO(start);
    const e = end ? parseISO(end) : null;
    if (!s || (end && !e)) return res.status(400).json({ error: 'Invalid start/end' });
    EVENTS[idx] = { ...EVENTS[idx], start: s.toISOString(), ...(e ? { end: e.toISOString() } : { end: undefined }) };
    res.json(EVENTS[idx]);
});