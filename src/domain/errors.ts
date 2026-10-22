export type DomainErrorCode =
  'INVALID_DATE' | 'EVENT_IN_PAST' | 'INVALID_CURRENCY' | 'INVALID_AMOUNT';

/**
 * Raised when an input breaks a domain invariant that schema validation cannot express
 * (for example, an event date that is already in the past relative to "today").
 * The service layer maps the code to an HTTP status; the domain stays transport-agnostic.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
