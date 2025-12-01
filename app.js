import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { isTestEnv } from './db/config.js';
import {
  getAllEvents,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  moveEvent,
  __setMemoryEvents,
  __getMemoryEvents,
  __setMemoryUsers,
  __getMemoryUsers,
  getUserByUid,
  createUserProfile,
  updateUserProfile as updateUserProfileQuery,
  validateRsvpStatus,
  upsertRsvp,
  getAttendeesForEvent,
  removeRsvp,
  __setMemoryAttendees,
  __getMemoryAttendees,
  addFriend,
  removeFriend,
  recommendFriends,
  analyticsSummary
} from './db/queries.js';
import { findConflicts } from './time-utils.js';

// --- Helpers ---
export function parseISO(s) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const cleanString = (val) => {
  if (val === undefined || val === null) return undefined;
  return String(val).trim();
};

export function isOverlapping(startA, endA, startB, endB) {
  if (!(startA instanceof Date) || !(startB instanceof Date)) return false;

  const aStart = startA.getTime();
  const aEnd = endA instanceof Date ? endA.getTime() : aStart;
  const bStart = startB.getTime();
  const bEnd = endB instanceof Date ? endB.getTime() : bStart;

  return aStart <= bEnd && bStart <= aEnd;
}

// Test helpers that now use database
export async function __setEvents(events) {
  if (!isTestEnv) {
    throw new Error('__setEvents can only run in test mode to avoid data loss.');
  }
  __setMemoryEvents(events || []);
}

export async function __getEvents() {
  if (!isTestEnv) {
    throw new Error('__getEvents can only run in test mode');
  }
  return __getMemoryEvents();
}

export async function __setUsers(users) {
  if (!isTestEnv) {
    throw new Error('__setUsers can only run in test mode to avoid data loss.');
  }
  __setMemoryUsers(users || []);
}

export async function __getUsers() {
  if (!isTestEnv) {
    throw new Error('__getUsers can only run in test mode');
  }
  return __getMemoryUsers();
}

export async function __setAttendees(attendees) {
  if (!isTestEnv) {
    throw new Error('__setAttendees can only run in test mode to avoid data loss.');
  }
  __setMemoryAttendees(attendees || []);
}

export async function __getAttendees() {
  if (!isTestEnv) {
    throw new Error('__getAttendees can only run in test mode');
  }
  return __getMemoryAttendees();
}

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cors());
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
    const { title, start, end, allDay = false, extendedProps = {}, type = null, recurrence = null } = req.body || {};
    if (!title || !start) {
      return res.status(400).json({ error: 'title and start are required' });
    }
    if (typeof extendedProps !== 'object' || Array.isArray(extendedProps)) {
      return res.status(400).json({ error: 'extendedProps must be an object' });
    }

    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;
    if (!startDate || (end && !endDate)) {
      return res.status(400).json({ error: 'start/end must be valid ISO strings' });
    }
    if (endDate && endDate.getTime() <= startDate.getTime()) {
      return res.status(400).json({ error: 'end must be after start' });
    }

    const event = await createEvent({
      title,
      start: startDate.toISOString(),
      end: endDate?.toISOString(),
      allDay,
      type,
      recurrence,
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
    const { title, start, end, allDay, extendedProps, type, recurrence } = req.body || {};
    
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
    if (updates.start && updates.end) {
      if (new Date(updates.end).getTime() <= new Date(updates.start).getTime()) {
        return res.status(400).json({ error: 'end must be after start' });
      }
    }
    if (allDay !== undefined) updates.allDay = Boolean(allDay);
    if (type !== undefined) updates.type = type;
    if (recurrence !== undefined) updates.recurrence = recurrence;
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
    if (e && e.getTime() <= s.getTime()) {
      return res.status(400).json({ error: 'end must be after start' });
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

// --- Users ---
const parseInterests = (value) => {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return null;
  return value.map((v) => cleanString(v)).filter(Boolean);
};

app.post('/users', async (req, res) => {
  try {
    const {
      uid,
      firebase_uid,
      email,
      displayName,
      display_name,
      photoURL,
      photo_url,
      major,
      year,
      bio,
      interests,
      friends,
    } = req.body || {};

    const resolvedUid = firebase_uid || uid;
    const resolvedDisplayName = cleanString(display_name ?? displayName);
    const resolvedEmail = cleanString(email);
    if (!resolvedUid || !resolvedDisplayName || !resolvedEmail) {
      return res.status(400).json({ error: 'uid, displayName, and email are required' });
    }

    const parsedInterests = parseInterests(interests);
    const parsedFriends = parseInterests(friends);
    if (parsedInterests === null || parsedFriends === null) {
      return res.status(400).json({ error: 'interests and friends must be arrays of strings' });
    }

    const user = await createUserProfile({
      uid: resolvedUid,
      email: resolvedEmail,
      displayName: resolvedDisplayName,
      photoURL: cleanString(photo_url ?? photoURL),
      major: cleanString(major),
      year: cleanString(year),
      bio: cleanString(bio) ?? '',
      interests: parsedInterests ?? [],
      friends: parsedFriends ?? [],
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:uid', async (req, res) => {
  try {
    const user = await getUserByUid(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/users/:uid', async (req, res) => {
  try {
    const {
      email,
      displayName,
      display_name,
      photoURL,
      photo_url,
      major,
      year,
      bio,
      interests,
      friends,
    } = req.body || {};

    const parsedInterests = parseInterests(interests);
    const parsedFriends = parseInterests(friends);
    if (parsedInterests === null || parsedFriends === null) {
      return res.status(400).json({ error: 'interests and friends must be arrays of strings' });
    }

    const updates = {
      email: cleanString(email),
      display_name: cleanString(display_name ?? displayName),
      photo_url: cleanString(photo_url ?? photoURL),
      major: cleanString(major),
      year: cleanString(year),
      bio: cleanString(bio),
      interests: parsedInterests ?? undefined,
      friends: parsedFriends ?? undefined,
    };

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided' });
    }

    const user = await updateUserProfileQuery(req.params.uid, filteredUpdates);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// RSVP endpoints
app.post('/events/:id/rsvp', async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, status } = req.body || {};
    if (!uid || !status) {
      return res.status(400).json({ error: 'uid and status are required' });
    }
    if (!validateRsvpStatus(status)) {
      return res.status(400).json({ error: 'Invalid status; use going|maybe|declined' });
    }

    const record = await upsertRsvp(id, uid, status);
    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating RSVP:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/events/:id/attendees', async (req, res) => {
  try {
    const attendees = await getAttendeesForEvent(req.params.id);
    res.json(attendees);
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/events/:id/rsvp/:uid', async (req, res) => {
  try {
    const removed = await removeRsvp(req.params.id, req.params.uid);
    if (!removed) return res.status(404).json({ error: 'RSVP not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting RSVP:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Social: friends & recommendations ---
app.post('/users/:uid/friends', async (req, res) => {
  try {
    const { friendUid } = req.body || {};
    if (!friendUid) return res.status(400).json({ error: 'friendUid is required' });
    const updated = await addFriend(req.params.uid, friendUid);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error adding friend:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:uid/friends/:friendUid', async (req, res) => {
  try {
    const updated = await removeFriend(req.params.uid, req.params.friendUid);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:uid/recommendations', async (req, res) => {
  try {
    const recs = await recommendFriends(req.params.uid);
    res.json(recs);
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Analytics ---
app.get('/analytics/summary', async (_req, res) => {
  try {
    const summary = await analyticsSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error getting analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const shouldListen = process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined;
if (shouldListen) {
  app.listen(PORT, () => {
    console.log(`CalendarMeet API server running at http://localhost:${PORT}`);
  });
}
