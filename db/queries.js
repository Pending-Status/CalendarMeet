import pool from './config.js';
import { nanoid } from 'nanoid';

export async function getAllEvents() {
  const result = await pool.query('SELECT * FROM events ORDER BY start');
  return result.rows;
}

export async function getEventsByDateRange(start, end) {
  const result = await pool.query(
    `SELECT * FROM events 
     WHERE (start <= $2 AND (end IS NULL OR end >= $1))
     ORDER BY start`,
    [start, end]
  );
  return result.rows;
}

export async function createEvent({ title, start, end, allDay, extendedProps }) {
  const id = nanoid();
  const result = await pool.query(
    `INSERT INTO events (id, title, start, end, all_day, extended_props)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, title, start, end, allDay, JSON.stringify(extendedProps)]
  );
  return result.rows[0];
}

export async function updateEvent(id, updates) {
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
  const result = await pool.query(
    'DELETE FROM events WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

export async function moveEvent(id, { start, end }) {
  const result = await pool.query(
    `UPDATE events
     SET start = $2, end = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, start, end]
  );
  return result.rows[0];
}