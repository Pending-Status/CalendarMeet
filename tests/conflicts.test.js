import { findConflicts } from '../time-utils.js';

describe('findConflicts', () => {
  const busy = [
    { start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z' },
    { start: '2024-01-01T12:00:00Z', end: '2024-01-01T13:00:00Z' },
  ];

  test('detects conflicts', () => {
    const conflicts = findConflicts(
      { start: '2024-01-01T10:30:00Z', end: '2024-01-01T12:30:00Z' },
      busy
    );
    expect(conflicts.length).toBe(2);
  });

  test('returns empty for non-overlap', () => {
    const conflicts = findConflicts(
      { start: '2024-01-01T13:30:00Z', end: '2024-01-01T14:00:00Z' },
      busy
    );
    expect(conflicts.length).toBe(0);
  });
});
