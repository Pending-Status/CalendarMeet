import { parseISO, isOverlapping } from '../app.js';

describe('parseISO', () => {
    test('parses valid ISO', () => {
        expect(parseISO('2024-01-01T00:00:00.000Z')?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
    test('returns null for invalid', () => {
        expect(parseISO('not-a-date')).toBeNull();
});
});

describe('isOverlapping', () => {
    const d = (s) => new Date(s);
    test('detects overlap', () => {
        expect(
            isOverlapping(d('2024-01-01T10:00:00Z'), d('2024-01-01T11:00:00Z'), d('2024-01-01T10:30:00Z'), d('2024-01-01T12:00:00Z'))
        ).toBe(true);
    });
    test('detects no overlap', () => {
        expect(
            isOverlapping(d('2024-01-01T10:00:00Z'), d('2024-01-01T11:00:00Z'), d('2024-01-01T11:00:01Z'), d('2024-01-01T12:00:00Z'))
        ).toBe(false);
    });
    test('handles null end (instantaneous)', () => {
        expect(isOverlapping(d('2024-01-01T10:00:00Z'), null, d('2024-01-01T10:00:00Z'), null)).toBe(true);
    });
});