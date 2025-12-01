// File: /src/utils/time-utils.js

/**
 * Checks if a specific time range is entirely free given a list of busy time slots.
 * @param {string} startTime - ISO date string for the proposed start time.
 * @param {string} endTime - ISO date string for the proposed end time.
 * @param {Array<{start: string, end: string}>} busySlots - An array of time slots where the user is busy.
 * @returns {boolean} True if the proposed slot is free, false otherwise.
 */
function isTimeSlotFree(startTime, endTime, busySlots) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  // Edge Case: Meeting must have a positive duration
  if (start >= end) {
    return false;
  }

  for (const slot of busySlots) {
    const busyStart = new Date(slot.start).getTime();
    const busyEnd = new Date(slot.end).getTime();

    // The condition for overlap is: (Proposed Start < Busy End) AND (Proposed End > Busy Start)
    if (start < busyEnd && end > busyStart) {
      return false; // Found a conflict
    }
  }

  return true; // No conflicts found
}

export function findConflicts(proposed, busySlots) {
  const { start, end } = proposed;
  const conflicts = [];
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || startMs >= endMs) {
    return conflicts;
  }

  for (const slot of busySlots) {
    const busyStart = new Date(slot.start).getTime();
    const busyEnd = new Date(slot.end).getTime();
    if (Number.isNaN(busyStart) || Number.isNaN(busyEnd)) continue;
    if (startMs < busyEnd && endMs > busyStart) {
      conflicts.push(slot);
    }
  }

  return conflicts;
}

export { isTimeSlotFree };
