import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, epochDayToIso, isValidIsoDate, isoToEpochDay } from './dates';
import { DomainError } from './errors';

describe('dates', () => {
  it('round-trips an ISO date through its epoch day', () => {
    expect(epochDayToIso(isoToEpochDay('2027-06-12'))).toBe('2027-06-12');
  });

  it('accepts a leap day only in leap years', () => {
    expect(isValidIsoDate('2028-02-29')).toBe(true);
    expect(isValidIsoDate('2027-02-29')).toBe(false);
  });

  it.each(['2026-02-30', '2026-13-01', '2026-2-3', '12/06/2027', '', 'tomorrow'])(
    'rejects "%s"',
    (value) => {
      expect(isValidIsoDate(value)).toBe(false);
      expect(() => isoToEpochDay(value)).toThrow(DomainError);
    },
  );

  it('counts whole days across a month boundary and a daylight-saving change', () => {
    expect(daysBetween('2026-01-31', '2026-03-01')).toBe(29);
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-21')).toBe(-3);
  });

  it('adds and subtracts days across month and year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2027-03-01', -1)).toBe('2027-02-28');
  });

  it('is its own inverse: addDays then daysBetween returns the offset', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 15_000, max: 30_000 }),
        fc.integer({ min: -900, max: 900 }),
        (day, offset) => {
          const start = epochDayToIso(day);
          expect(daysBetween(start, addDays(start, offset))).toBe(offset);
        },
      ),
    );
  });
});
