import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import {
  getAllEvents,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  moveEvent
} from './db/queries.js';

// --- Helpers ---
export function parseISO(s) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// Test helpers that now use database
export async function __setEvents(events) {
  await pool.query('DELETE FROM events');
  if (Array.isArray(events) && events.length > 0) {
    const values = events.map(evt => [
      evt.id || nanoid(),
      evt.title,
      evt.start,
      evt.end,
      evt.allDay || false,
      evt.extendedProps || {}
    ]);
    
    const placeholders = values.map((_, i) => 
      `($${i*6 + 1}, $${i*6 + 2}, $${i*6 + 3}, $${i*6 + 4}, $${i*6 + 5}, $${i*6 + 6}::jsonb)`
    ).join(',');
    
    await pool.query(
      `INSERT INTO events (id, title, start, end, all_day, extended_props) 
       VALUES ${placeholders}`,
      values.flat()
    );
  }
}

export async function __getEvents() {
  const result = await pool.query('SELECT * FROM events ORDER BY start');
  return result.rows;
}

export const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// List events
app.get('/events', async (req, res) => {
  try {
    const { start, end } = req.query;
    let events;
    
    if (start && end) {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Invalid start or end ISO date' });
      }
      events = await getEventsByDateRange(startDate.toISOString(), endDate.toISOString());
    } else {
      events = await getAllEvents();
    }
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event
app.post('/events', async (req, res) => {
  try {
    const { title, start, end, allDay = false, extendedProps = {} } = req.body || {};
    if (!title || !start) {
      return res.status(400).json({ error: 'title and start are required' });
    }

    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;
    if (!startDate || (end && !endDate)) {
      return res.status(400).json({ error: 'start/end must be valid ISO strings' });
    }

    const event = await createEvent({
      title,
      start: startDate.toISOString(),
      end: endDate?.toISOString(),
      allDay,
      extendedProps
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
app.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start, end, allDay, extendedProps } = req.body || {};
    
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (start !== undefined) {
      const d = parseISO(start);
      if (!d) return res.status(400).json({ error: 'Invalid start' });
      updates.start = d.toISOString();
    }
    if (end !== undefined) {
      if (end === null) {
        updates.end = null;
      } else {
        const d = parseISO(end);
        if (!d) return res.status(400).json({ error: 'Invalid end' });
        updates.end = d.toISOString();
      }
    }
    if (allDay !== undefined) updates.allDay = Boolean(allDay);
    if (extendedProps !== undefined) {
      if (typeof extendedProps !== 'object') {
        return res.status(400).json({ error: 'extendedProps must be object' });
      }
      updates.extendedProps = extendedProps;
    }

    const event = await updateEvent(id, updates);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
app.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await deleteEvent(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move/resize event
app.post('/events/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body || {};
    
    const s = parseISO(start);
    const e = end ? parseISO(end) : null;
    if (!s || (end && !e)) {
      return res.status(400).json({ error: 'Invalid start/end' });
    }

    const event = await moveEvent(id, {
      start: s.toISOString(),
      end: e?.toISOString()
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error('Error moving event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});