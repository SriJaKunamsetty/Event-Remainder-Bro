import fc from 'fast-check';
import {
  ACCESSIBILITY_NEEDS,
  DIETARY_NEEDS,
  EVENT_TYPES,
  MAX_BUDGET_MINOR,
  MAX_GUESTS,
  PLANNER_EXPERIENCE,
  PRIORITY_CATEGORIES,
  VENUE_TYPES,
  type EventBrief,
} from '../schemas';

/** A valid wedding brief; tests override only the fields they care about. */
export function makeBrief(overrides: Partial<EventBrief> = {}): EventBrief {
  return {
    eventType: 'wedding',
    eventDate: '2027-06-12',
    guestCount: 150,
    totalBudgetMinor: 50_000_000,
    currency: 'INR',
    venueType: 'indoor',
    priorities: [],
    servesAlcohol: false,
    dietaryNeeds: [],
    accessibilityNeeds: [],
    plannerExperience: 'first_time',
    ...overrides,
  };
}

export const briefArbitrary: fc.Arbitrary<EventBrief> = fc.record({
  eventType: fc.constantFrom(...EVENT_TYPES),
  eventDate: fc.constant('2027-06-12'),
  guestCount: fc.integer({ min: 1, max: MAX_GUESTS }),
  totalBudgetMinor: fc.integer({ min: 1, max: MAX_BUDGET_MINOR }),
  currency: fc.constant('INR'),
  venueType: fc.constantFrom(...VENUE_TYPES),
  priorities: fc.uniqueArray(fc.constantFrom(...PRIORITY_CATEGORIES), { maxLength: 3 }),
  servesAlcohol: fc.boolean(),
  dietaryNeeds: fc.uniqueArray(fc.constantFrom(...DIETARY_NEEDS)),
  accessibilityNeeds: fc.uniqueArray(fc.constantFrom(...ACCESSIBILITY_NEEDS)),
  plannerExperience: fc.constantFrom(...PLANNER_EXPERIENCE),
});
