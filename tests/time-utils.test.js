// File: /tests/time-utils.test.js
// Note: You must update the require path based on where you place the utility file.
import { isTimeSlotFree, findConflicts } from '../time-utils.js'; 

describe('Time Utilities: isTimeSlotFree', () => {
    // A fixed set of busy times to test against
    const busySlots = [
        { start: '2025-10-20T10:00:00Z', end: '2025-10-20T11:00:00Z' }, // Busy Slot 1 (Morning)
        { start: '2025-10-20T14:00:00Z', end: '2025-10-20T16:00:00Z' }  // Busy Slot 2 (Afternoon)
    ];

    // Test Case 1: Basic functionality - Slot is entirely free
    test('should return true for a time slot completely free from conflicts', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T12:00:00Z', // Starts in the gap
            '2025-10-20T13:00:00Z', // Ends in the gap
            busySlots
        );
        expect(isFree).toBe(true);
    });

    // Test Case 2: Verification of Error - Meeting starts during a busy slot
    test('should return false when the meeting starts during a busy slot', () => {
        // Meeting starts at 10:30 (inside 10:00-11:00)
        const isFree = isTimeSlotFree(
            '2025-10-20T10:30:00Z', 
            '2025-10-20T11:30:00Z', 
            busySlots
        );
        expect(isFree).toBe(false);
    });

    // Test Case 3: Verification of Error - Meeting is entirely contained within a busy slot
    test('should return false when the meeting is entirely contained within a busy slot', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T14:30:00Z', 
            '2025-10-20T15:30:00Z', 
            busySlots
        );
        expect(isFree).toBe(false);
    });

    // Test Case 4: Edge Case - Meeting ends exactly when a busy slot starts (should be free)
    test('should return true when the meeting is exactly adjacent and ends at a busy slot start', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T09:00:00Z', 
            '2025-10-20T10:00:00Z', // Ends precisely when Busy Slot 1 begins
            busySlots
        );
        expect(isFree).toBe(true);
    });
    
    // Test Case 5: Edge Case - Meeting starts exactly when a busy slot ends (should be free)
    test('should return true when the meeting is exactly adjacent and starts at a busy slot end', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T11:00:00Z', // Starts precisely when Busy Slot 1 ends
            '2025-10-20T12:00:00Z', 
            busySlots
        );
        expect(isFree).toBe(true);
    });

    // Test Case 6: Edge Case - Busy slot list is empty
    test('should return true if the busy slots array is empty (no conflicts possible)', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T14:30:00Z', 
            '2025-10-20T15:30:00Z', 
            []
        );
        expect(isFree).toBe(true);
    });

    // Test Case 7: Edge Case - Invalid time range (start time is after end time)
    test('should return false if the start time is after or equal to the end time', () => {
        const isFree = isTimeSlotFree(
            '2025-10-20T15:00:00Z', 
            '2025-10-20T14:00:00Z', 
            busySlots
        );
        expect(isFree).toBe(false);
    });

    describe('findConflicts', () => {
        test('returns overlapping slots', () => {
            const conflicts = findConflicts(
                { start: '2025-10-20T10:30:00Z', end: '2025-10-20T12:00:00Z' },
                busySlots
            );
            expect(conflicts.length).toBe(1);
            expect(conflicts[0].start).toBe('2025-10-20T10:00:00Z');
        });

        test('returns empty for invalid proposed range', () => {
            const conflicts = findConflicts(
                { start: 'bad', end: 'also-bad' },
                busySlots
            );
            expect(conflicts.length).toBe(0);
        });
    });
}); 
