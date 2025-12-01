import pool, { isTestEnv } from './config.js';
import { nanoid } from 'nanoid';

let memoryEvents = [];
let memoryUsers = [];
let memoryAttendees = [];

const cloneUser = (user) => ({
  ...user,
  interests: Array.isArray(user.interests) ? [...user.interests] : [],
  friends: Array.isArray(user.friends) ? [...user.friends] : [],
});

const cloneEvent = (event) => ({
  ...event,
  extended_props: JSON.parse(JSON.stringify(event.extended_props ?? {})),
});

const sortEvents = (events) =>
  [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

const normalizeEvent = (event) => ({
  id: event.id || nanoid(),
  title: event.title,
  start: event.start,
  end: event.end ?? null,
  all_day: event.all_day ?? event.allDay ?? false,
  type: event.type ?? null,
  recurrence: event.recurrence ?? null,
  extended_props: event.extended_props ?? event.extendedProps ?? {},
  created_at: event.created_at,
  updated_at: event.updated_at,
});

export function __setMemoryEvents(events = []) {
  memoryEvents = sortEvents(
    events.map((evt) =>
      cloneEvent({
        ...normalizeEvent(evt),
        created_at: evt.created_at ?? new Date().toISOString(),
        updated_at: evt.updated_at ?? new Date().toISOString(),
      })
    )
  );
}

export function __getMemoryEvents() {
  return sortEvents(memoryEvents).map(cloneEvent);
}

export function __setMemoryUsers(users = []) {
  memoryUsers = users.map((u) =>
    cloneUser({
      firebase_uid: u.firebase_uid ?? u.uid,
      email: u.email,
      display_name: u.display_name ?? u.displayName,
      photo_url: u.photo_url ?? u.photoURL ?? null,
      major: u.major ?? null,
      year: u.year ?? null,
      bio: u.bio ?? '',
      interests: Array.isArray(u.interests) ? u.interests.map(String) : [],
      friends: Array.isArray(u.friends) ? u.friends.map(String) : [],
      created_at: u.created_at ?? new Date().toISOString(),
      updated_at: u.updated_at ?? new Date().toISOString(),
    })
  );
}

export function __getMemoryUsers() {
  return memoryUsers.map(cloneUser);
}

export function __setMemoryAttendees(attendees = []) {
  memoryAttendees = attendees.map((att) => ({
    event_id: att.event_id,
    user_uid: att.user_uid ?? att.uid,
    status: att.status,
    created_at: att.created_at ?? new Date().toISOString(),
    updated_at: att.updated_at ?? new Date().toISOString(),
  }));
}

export function __getMemoryAttendees() {
  return memoryAttendees.map((a) => ({ ...a }));
}

export async function getAllEvents() {
  if (isTestEnv) {
    return __getMemoryEvents();
  }

  const result = await pool.query('SELECT * FROM events ORDER BY start');
  return result.rows;
}

export async function getEventsByDateRange(start, end) {
  if (isTestEnv) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return __getMemoryEvents().filter((evt) => {
      const evtStart = new Date(evt.start).getTime();
      const evtEnd = evt.end ? new Date(evt.end).getTime() : null;
      return evtStart <= endTime && (evtEnd === null || evtEnd >= startTime);
    });
  }

  const result = await pool.query(
    `SELECT * FROM events 
     WHERE (start <= $2 AND (end IS NULL OR end >= $1))
     ORDER BY start`,
    [start, end]
  );
  return result.rows;
}

export async function createEvent({ title, start, end, allDay, extendedProps, type, recurrence }) {
  if (isTestEnv) {
    const now = new Date().toISOString();
    const event = {
      id: nanoid(),
      title,
      start,
      end: end ?? null,
      all_day: Boolean(allDay),
      type: type ?? null,
      recurrence: recurrence ?? null,
      extended_props: extendedProps ?? {},
      created_at: now,
      updated_at: now,
    };
    memoryEvents.push(event);
    return cloneEvent(event);
  }

  const result = await pool.query(
    `INSERT INTO events (id, title, start, end, all_day, type, recurrence, extended_props)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [nanoid(), title, start, end, allDay, type, recurrence ? JSON.stringify(recurrence) : null, JSON.stringify(extendedProps)]
  );
  return result.rows[0];
}

export async function updateEvent(id, updates) {
  if (isTestEnv) {
    const index = memoryEvents.findIndex((evt) => evt.id === id);
    if (index === -1) return null;

    const existing = memoryEvents[index];
    const updated = {
      ...existing,
      title: updates.title ?? existing.title,
      start: updates.start ?? existing.start,
      end: updates.end ?? existing.end,
      all_day:
        updates.allDay !== undefined ? Boolean(updates.allDay) : existing.all_day,
      extended_props:
        updates.extendedProps !== undefined
          ? updates.extendedProps
          : existing.extended_props,
      updated_at: new Date().toISOString(),
    };
    memoryEvents[index] = updated;
    return cloneEvent(updated);
  }

  const setClause = [];
  const values = [id];
  let paramIndex = 2;

  if (updates.title !== undefined) {
    setClause.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }
  if (updates.start !== undefined) {
    setClause.push(`start = $${paramIndex}`);
    values.push(updates.start);
    paramIndex++;
  }
  if (updates.end !== undefined) {
    setClause.push(`end = $${paramIndex}`);
    values.push(updates.end);
    paramIndex++;
  }
  if (updates.allDay !== undefined) {
    setClause.push(`all_day = $${paramIndex}`);
    values.push(updates.allDay);
    paramIndex++;
  }
  if (updates.type !== undefined) {
    setClause.push(`type = $${paramIndex}`);
    values.push(updates.type);
    paramIndex++;
  }
  if (updates.recurrence !== undefined) {
    setClause.push(`recurrence = $${paramIndex}`);
    values.push(updates.recurrence ? JSON.stringify(updates.recurrence) : null);
    paramIndex++;
  }
  if (updates.extendedProps !== undefined) {
    setClause.push(`extended_props = $${paramIndex}`);
    values.push(JSON.stringify(updates.extendedProps));
    paramIndex++;
  }

  setClause.push('updated_at = CURRENT_TIMESTAMP');

  const result = await pool.query(
    `UPDATE events 
     SET ${setClause.join(', ')}
     WHERE id = $1
     RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteEvent(id) {
  if (isTestEnv) {
    const index = memoryEvents.findIndex((evt) => evt.id === id);
    if (index === -1) return null;

    const [removed] = memoryEvents.splice(index, 1);
    return cloneEvent(removed);
  }

  const result = await pool.query(
    'DELETE FROM events WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

export async function moveEvent(id, { start, end }) {
  if (isTestEnv) {
    return updateEvent(id, { start, end });
  }

  const result = await pool.query(
    `UPDATE events
     SET start = $2, end = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, start, end]
  );
  return result.rows[0];
}

const normalizeUser = (data) => ({
  firebase_uid: data.firebase_uid ?? data.uid,
  email: data.email,
  display_name: data.display_name ?? data.displayName,
  photo_url: data.photo_url ?? data.photoURL ?? null,
  major: data.major ?? null,
  year: data.year ?? null,
  bio: data.bio ?? '',
  interests: Array.isArray(data.interests) ? data.interests.map(String) : [],
  friends: Array.isArray(data.friends) ? data.friends.map(String) : [],
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export async function getUserByUid(uid) {
  if (isTestEnv) {
    const user = memoryUsers.find((u) => u.firebase_uid === uid);
    return user ? cloneUser(user) : null;
  }

  const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
  return result.rows[0] ?? null;
}

const validRsvpStatuses = new Set(['going', 'maybe', 'declined']);

export function validateRsvpStatus(status) {
  return typeof status === 'string' && validRsvpStatuses.has(status);
}

export async function upsertRsvp(eventId, userUid, status) {
  if (!validateRsvpStatus(status)) {
    throw new Error('Invalid RSVP status');
  }

  if (isTestEnv) {
    const now = new Date().toISOString();
    const existingIndex = memoryAttendees.findIndex(
      (a) => a.event_id === eventId && a.user_uid === userUid
    );
    const record = {
      event_id: eventId,
      user_uid: userUid,
      status,
      created_at: existingIndex === -1 ? now : memoryAttendees[existingIndex].created_at,
      updated_at: now,
    };
    if (existingIndex === -1) {
      memoryAttendees.push(record);
    } else {
      memoryAttendees[existingIndex] = record;
    }
    return { ...record };
  }

  const result = await pool.query(
    `INSERT INTO event_attendees (event_id, user_uid, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (event_id, user_uid) DO UPDATE SET
       status = EXCLUDED.status,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [eventId, userUid, status]
  );
  return result.rows[0];
}

export async function getAttendeesForEvent(eventId) {
  if (isTestEnv) {
    return memoryAttendees.filter((a) => a.event_id === eventId).map((a) => ({ ...a }));
  }

  const result = await pool.query(
    'SELECT * FROM event_attendees WHERE event_id = $1 ORDER BY created_at',
    [eventId]
  );
  return result.rows;
}

export async function removeRsvp(eventId, userUid) {
  if (isTestEnv) {
    const index = memoryAttendees.findIndex((a) => a.event_id === eventId && a.user_uid === userUid);
    if (index === -1) return null;
    const [removed] = memoryAttendees.splice(index, 1);
    return removed;
  }

  const result = await pool.query(
    'DELETE FROM event_attendees WHERE event_id = $1 AND user_uid = $2 RETURNING *',
    [eventId, userUid]
  );
  return result.rows[0] ?? null;
}

export async function createUserProfile(data) {
  const user = normalizeUser(data);

  if (isTestEnv) {
    const existingIndex = memoryUsers.findIndex((u) => u.firebase_uid === user.firebase_uid);
    const now = new Date().toISOString();
    const record = {
      ...user,
      created_at: user.created_at ?? now,
      updated_at: user.updated_at ?? now,
    };
    if (existingIndex === -1) {
      memoryUsers.push(record);
    } else {
      memoryUsers[existingIndex] = { ...memoryUsers[existingIndex], ...record, updated_at: now };
    }
    return cloneUser(record);
  }

  const result = await pool.query(
    `INSERT INTO users (firebase_uid, email, display_name, photo_url, major, year, bio, interests, friends)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (firebase_uid) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = EXCLUDED.display_name,
       photo_url = EXCLUDED.photo_url,
       major = EXCLUDED.major,
       year = EXCLUDED.year,
       bio = EXCLUDED.bio,
       interests = EXCLUDED.interests,
       friends = EXCLUDED.friends,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      user.firebase_uid,
      user.email,
      user.display_name,
      user.photo_url,
      user.major,
      user.year,
      user.bio,
      user.interests,
      user.friends,
    ]
  );
  return result.rows[0];
}

export async function updateUserProfile(uid, updates) {
  if (isTestEnv) {
    const index = memoryUsers.findIndex((u) => u.firebase_uid === uid);
    if (index === -1) return null;
    const now = new Date().toISOString();
    memoryUsers[index] = {
      ...memoryUsers[index],
      ...updates,
      interests:
        updates.interests !== undefined
          ? Array.isArray(updates.interests)
            ? updates.interests.map(String)
            : memoryUsers[index].interests
          : memoryUsers[index].interests,
      friends:
        updates.friends !== undefined
          ? Array.isArray(updates.friends)
            ? updates.friends.map(String)
            : memoryUsers[index].friends
          : memoryUsers[index].friends,
      updated_at: now,
    };
    return cloneUser(memoryUsers[index]);
  }

  const setClause = [];
  const values = [uid];
  let paramIndex = 2;

  const push = (clause, value) => {
    setClause.push(`${clause} = $${paramIndex}`);
    values.push(value);
    paramIndex += 1;
  };

  if (updates.email !== undefined) push('email', updates.email);
  if (updates.display_name !== undefined || updates.displayName !== undefined) {
    push('display_name', updates.display_name ?? updates.displayName);
  }
  if (updates.photo_url !== undefined || updates.photoURL !== undefined) {
    push('photo_url', updates.photo_url ?? updates.photoURL);
  }
  if (updates.major !== undefined) push('major', updates.major);
  if (updates.year !== undefined) push('year', updates.year);
  if (updates.bio !== undefined) push('bio', updates.bio);
  if (updates.interests !== undefined) push('interests', updates.interests);
  if (updates.friends !== undefined) push('friends', updates.friends);

  setClause.push('updated_at = CURRENT_TIMESTAMP');

  const result = await pool.query(
    `UPDATE users
     SET ${setClause.join(', ')}
     WHERE firebase_uid = $1
     RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function addFriend(uid, friendUid) {
  if (isTestEnv) {
    const index = memoryUsers.findIndex((u) => u.firebase_uid === uid);
    if (index === -1) return null;
    const user = memoryUsers[index];
    const friends = new Set(user.friends || []);
    friends.add(friendUid);
    memoryUsers[index] = { ...user, friends: Array.from(friends), updated_at: new Date().toISOString() };
    return cloneUser(memoryUsers[index]);
  }

  const result = await pool.query(
    `UPDATE users
     SET friends = array(SELECT DISTINCT unnest(COALESCE(friends, '{}') || $2::text[])),
         updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $1
     RETURNING *`,
    [uid, [friendUid]]
  );
  return result.rows[0] ?? null;
}

export async function removeFriend(uid, friendUid) {
  if (isTestEnv) {
    const index = memoryUsers.findIndex((u) => u.firebase_uid === uid);
    if (index === -1) return null;
    const user = memoryUsers[index];
    memoryUsers[index] = {
      ...user,
      friends: (user.friends || []).filter((f) => f !== friendUid),
      updated_at: new Date().toISOString(),
    };
    return cloneUser(memoryUsers[index]);
  }

  const result = await pool.query(
    `UPDATE users
     SET friends = array_remove(COALESCE(friends, '{}'), $2),
         updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $1
     RETURNING *`,
    [uid, friendUid]
  );
  return result.rows[0] ?? null;
}

export async function recommendFriends(uid) {
  if (isTestEnv) {
    const me = memoryUsers.find((u) => u.firebase_uid === uid);
    if (!me) return [];
    const myInterests = new Set(me.interests || []);
    return memoryUsers
      .filter((u) => u.firebase_uid !== uid && !(me.friends || []).includes(u.firebase_uid))
      .map((u) => {
        const overlap = (u.interests || []).filter((i) => myInterests.has(i)).length;
        return { ...cloneUser(u), overlap };
      })
      .sort((a, b) => b.overlap - a.overlap);
  }

  const userResult = await pool.query('SELECT interests, friends FROM users WHERE firebase_uid = $1', [
    uid,
  ]);
  if (userResult.rows.length === 0) return [];
  const { interests = [], friends = [] } = userResult.rows[0];

  const result = await pool.query(
    `SELECT firebase_uid, email, display_name, photo_url, major, year, bio, interests, friends, created_at, updated_at
     FROM users
     WHERE firebase_uid <> $1
       AND NOT (firebase_uid = ANY($2))
     LIMIT 50`,
    [uid, friends]
  );

  return result.rows
    .map((u) => {
      const overlap = (u.interests || []).filter((i) => interests.includes(i)).length;
      return { ...u, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap);
}

export async function analyticsSummary() {
  if (isTestEnv) {
    const totalEvents = memoryEvents.length;
    const totalUsers = memoryUsers.length;
    const totalRsvps = memoryAttendees.length;
    return {
      totalEvents,
      totalUsers,
      totalRsvps,
    };
  }

  const [eventsRes, usersRes, rsvpRes] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM events'),
    pool.query('SELECT COUNT(*)::int AS count FROM users'),
    pool.query('SELECT COUNT(*)::int AS count FROM event_attendees'),
  ]);

  return {
    totalEvents: eventsRes.rows[0].count,
    totalUsers: usersRes.rows[0].count,
    totalRsvps: rsvpRes.rows[0].count,
  };
}
