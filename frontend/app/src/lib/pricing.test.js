import { describe, expect, it } from 'vitest';
import { bookingRange, computePrice, fitToOpeningHours, formulasOn, halfDaysOn, isWithinOpeningHours } from './pricing.js';

const space = { hourRate: 4, halfDayRate: 14, dayRate: 25, monthRate: 250 };

// November 2026 (months start at 0 in JavaScript)
const saturday = new Date(2026, 10, 14);
const sunday = new Date(2026, 10, 15);
const monday = new Date(2026, 10, 16);
const at = (day, hour) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);

describe('formulasOn', () => {
    it('offers no formula on Sunday', () => {
        expect(formulasOn(sunday)).toEqual([]);
    });
    it('offers no day formula on Saturday', () => {
        expect(formulasOn(saturday)).toEqual(['HOUR', 'HALF_DAY', 'MONTH']);
    });
});

describe('halfDaysOn', () => {
    it('offers only the morning on Saturday', () => {
        expect(halfDaysOn(saturday)).toEqual(['MORNING']);
    });
});

describe('bookingRange', () => {
    it('books a weekday DAY from 8:00 to 19:00', () => {
        expect(bookingRange({ formula: 'DAY', date: monday })).toEqual({ start: at(monday, 8), end: at(monday, 19) });
    });
    it('ends a month at closing time on the day before the same date next month', () => {
        expect(bookingRange({ formula: 'MONTH', date: monday }))
            .toEqual({ start: at(monday, 8), end: new Date(2026, 11, 15, 19) });
    });
});

describe('isWithinOpeningHours', () => {
    it('accepts a weekday booking that ends at closing time', () => {
        expect(isWithinOpeningHours(at(monday, 18), at(monday, 19))).toBe(true);
    });
    it('rejects a weekday booking that ends after closing time', () => {
        expect(isWithinOpeningHours(at(monday, 18), at(monday, 20))).toBe(false);
    });
    it('rejects a Saturday booking after 13:00', () => {
        expect(isWithinOpeningHours(at(saturday, 13), at(saturday, 14))).toBe(false);
    });
    it('rejects any booking on Sunday', () => {
        expect(isWithinOpeningHours(at(sunday, 9), at(sunday, 10))).toBe(false);
    });
});

describe('fitToOpeningHours', () => {
    it('moves a Sunday to the next Monday', () => {
        const values = { formula: 'DAY', date: sunday, startHour: 9, hours: 2, halfDay: 'MORNING' };
        expect(fitToOpeningHours(values)).toMatchObject({ formula: 'DAY', date: monday });
    });
});

describe('computePrice', () => {
    it('charges two hours at the hourly rate', () => {
        expect(computePrice(space, at(monday, 9), at(monday, 11))).toMatchObject({ formula: 'HOUR', quantity: 2, total: 8 });
    });
    it('charges nothing for a formula with a 0 € rate', () => {
        const freeDay = { ...space, dayRate: 0 };
        expect(computePrice(freeDay, at(monday, 8), at(monday, 19))).toMatchObject({ formula: 'DAY', total: 0 });
    });
});
