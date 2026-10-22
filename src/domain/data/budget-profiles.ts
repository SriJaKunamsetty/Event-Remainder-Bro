import type { EventType, PriorityCategory } from '../schemas';

export interface BudgetProfile {
  /** Relative weights for each category that applies to the event type (contingency excluded). */
  readonly weights: Readonly<Partial<Record<PriorityCategory, number>>>;
  /** Share of the total held back for surprises, in basis points (100 bp = 1%). */
  readonly contingencyBp: number;
}

/**
 * Starting splits, kept as data so they can be reviewed and tuned without touching logic.
 * Weights are relative: only their proportions matter, not their sum.
 */
export const BUDGET_PROFILES: Readonly<Record<EventType, BudgetProfile>> = {
  wedding: {
    weights: {
      venue: 28,
      catering: 32,
      decor: 10,
      entertainment: 7,
      photography: 9,
      attire: 8,
      invitations: 2,
      logistics: 4,
      permits: 2,
    },
    contingencyBp: 1000,
  },
  birthday: {
    weights: {
      venue: 22,
      catering: 30,
      decor: 14,
      entertainment: 18,
      photography: 5,
      invitations: 3,
      logistics: 6,
      permits: 1,
    },
    contingencyBp: 800,
  },
  community: {
    weights: {
      venue: 15,
      catering: 22,
      decor: 6,
      entertainment: 14,
      photography: 3,
      invitations: 6,
      logistics: 20,
      permits: 8,
    },
    contingencyBp: 1200,
  },
};
