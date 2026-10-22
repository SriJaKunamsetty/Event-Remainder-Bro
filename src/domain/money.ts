import { DomainError } from './errors';

/**
 * Amounts are stored as integers in the currency's minor unit (cents, paise, ...).
 * Integer arithmetic keeps every split exact; floating point never touches money.
 */
export function currencyExponent(currency: string): number {
  try {
    const options = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions();
    // Resolves minor unit exponent safely without non-null assertion
    return typeof options.maximumFractionDigits === 'number' ? options.maximumFractionDigits : 2;
  } catch {
    throw new DomainError('INVALID_CURRENCY', `"${currency}" is not a valid ISO 4217 code.`);
  }
}

export function toMinorUnits(major: number, currency: string): number {
  if (!Number.isFinite(major) || major < 0) {
    throw new DomainError('INVALID_AMOUNT', 'Amount must be a finite, non-negative number.');
  }
  const minor = Math.round(major * 10 ** currencyExponent(currency));
  if (!Number.isSafeInteger(minor)) {
    throw new DomainError('INVALID_AMOUNT', 'Amount is too large to represent safely.');
  }
  return minor;
}

export function formatMinor(minor: number, currency: string, locale = 'en-US'): string {
  const exponent = currencyExponent(currency);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    minor / 10 ** exponent,
  );
}
