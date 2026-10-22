import { DomainError } from './errors';

const MS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * All date maths uses whole UTC days. Local time zones and daylight-saving shifts never
 * enter the calculation, so results are identical on a laptop, in CI and on Vercel.
 */
export function isoToEpochDay(iso: string): number {
  const match = ISO_DATE_PATTERN.exec(iso);
  if (!match) {
    throw new DomainError('INVALID_DATE', `Expected a YYYY-MM-DD date, received "${iso}".`);
  }
  const [, year, month, day] = match;
  const ms = Date.UTC(Number(year), Number(month) - 1, Number(day));
  // Round-tripping rejects impossible dates such as 2026-02-30, which Date.UTC would roll over.
  if (new Date(ms).toISOString().slice(0, 10) !== iso) {
    throw new DomainError('INVALID_DATE', `"${iso}" is not a real calendar date.`);
  }
  return ms / MS_PER_DAY;
}

export function epochDayToIso(epochDay: number): string {
  return new Date(epochDay * MS_PER_DAY).toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string): boolean {
  try {
    isoToEpochDay(value);
    return true;
  } catch {
    return false;
  }
}

/** Whole days from `fromIso` to `toIso`; negative when `toIso` is earlier. */
export function daysBetween(fromIso: string, toIso: string): number {
  return isoToEpochDay(toIso) - isoToEpochDay(fromIso);
}

export function addDays(iso: string, days: number): string {
  return epochDayToIso(isoToEpochDay(iso) + days);
}
