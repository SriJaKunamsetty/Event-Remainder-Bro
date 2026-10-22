import { describe, expect, it } from 'vitest';
import { makeBrief } from './__fixtures__/briefs';
import { EventBriefSchema, MAX_BUDGET_MINOR, MAX_GUESTS, MAX_NOTES_LENGTH } from './schemas';

const accepts = (input: unknown): boolean => EventBriefSchema.safeParse(input).success;

describe('EventBriefSchema', () => {
  it('accepts a complete brief', () => {
    expect(accepts(makeBrief())).toBe(true);
  });

  it('applies defaults for optional context fields', () => {
    const parsed = EventBriefSchema.parse({
      eventType: 'birthday',
      eventDate: '2027-06-12',
      guestCount: 30,
      totalBudgetMinor: 2_000_000,
      currency: 'INR',
      venueType: 'indoor',
    });
    expect(parsed).toMatchObject({
      priorities: [],
      servesAlcohol: false,
      dietaryNeeds: [],
      accessibilityNeeds: [],
      plannerExperience: 'first_time',
    });
  });

  it('trims notes', () => {
    expect(EventBriefSchema.parse(makeBrief({ notes: '  garden theme  ' })).notes).toBe(
      'garden theme',
    );
  });

  it('rejects unknown keys so extra payload cannot slip through', () => {
    expect(accepts({ ...makeBrief(), isAdmin: true })).toBe(false);
  });

  it.each([
    ['zero guests', { guestCount: 0 }],
    ['too many guests', { guestCount: MAX_GUESTS + 1 }],
    ['fractional guests', { guestCount: 10.5 }],
    ['zero budget', { totalBudgetMinor: 0 }],
    ['budget above the safe ceiling', { totalBudgetMinor: MAX_BUDGET_MINOR + 1 }],
    ['fractional budget', { totalBudgetMinor: 100.5 }],
    ['lower-case currency', { currency: 'inr' }],
    ['long currency', { currency: 'INRR' }],
    ['impossible date', { eventDate: '2027-02-30' }],
    ['non-ISO date', { eventDate: '12/06/2027' }],
    ['unknown event type', { eventType: 'funeral' }],
    ['duplicate priorities', { priorities: ['venue', 'venue'] }],
    ['more than three priorities', { priorities: ['venue', 'decor', 'catering', 'permits'] }],
    ['contingency as a priority', { priorities: ['contingency'] }],
    ['overlong notes', { notes: 'x'.repeat(MAX_NOTES_LENGTH + 1) }],
  ])('rejects %s', (_label, overrides) => {
    expect(accepts({ ...makeBrief(), ...overrides })).toBe(false);
  });
});
