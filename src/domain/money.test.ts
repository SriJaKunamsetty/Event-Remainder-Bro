import { describe, expect, it } from 'vitest';
import { DomainError } from './errors';
import { currencyExponent, formatMinor, toMinorUnits } from './money';

describe('money', () => {
  it('knows how many minor-unit digits a currency uses', () => {
    expect(currencyExponent('USD')).toBe(2);
    expect(currencyExponent('INR')).toBe(2);
    expect(currencyExponent('JPY')).toBe(0);
    expect(currencyExponent('KWD')).toBe(3);
  });

  it('rejects ill-formed currency codes', () => {
    expect(() => currencyExponent('US')).toThrowError(DomainError);
  });

  it('converts major units to integer minor units', () => {
    expect(toMinorUnits(1234.5, 'USD')).toBe(123_450);
    expect(toMinorUnits(1500, 'JPY')).toBe(1500);
    expect(toMinorUnits(0, 'INR')).toBe(0);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 1e300])('rejects amount %s', (amount) => {
    expect(() => toMinorUnits(amount, 'USD')).toThrowError(DomainError);
  });

  it('formats minor units for display', () => {
    expect(formatMinor(123_450, 'USD')).toBe('$1,234.50');
    expect(formatMinor(1500, 'JPY')).toBe('¥1,500');
  });
});
