import { BUDGET_PROFILES } from './data/budget-profiles';
import { distributeByLargestRemainder } from './distribute';
import {
  PRIORITY_CATEGORIES,
  type BudgetCategory,
  type EventBrief,
  type PriorityCategory,
} from './schemas';

const BASIS_POINTS = 10_000;
/** Multipliers are in quarters so all weighting stays integer: 4 = x1, 8 = x2. */
const DEFAULT_QUARTERS = 4;
const PRIORITY_QUARTERS_BY_RANK = [8, 6, 5] as const;
const NON_INDOOR_LOGISTICS_EXTRA = 4;
const ALCOHOL_PERMITS_EXTRA = 3;
const ACCESSIBILITY_LOGISTICS_PER_NEED = 1;
const ACCESSIBILITY_LOGISTICS_CAP = 4;

type Weights = Partial<Record<PriorityCategory, number>>;

export interface BudgetLine {
  readonly category: BudgetCategory;
  readonly amountMinor: number;
  readonly sharePercent: number;
}

export interface BudgetPlan {
  readonly currency: string;
  readonly totalMinor: number;
  readonly perGuestMinor: number;
  readonly lines: ReadonlyArray<BudgetLine>;
  /** Plain-language reasons behind the split, so the user can see and challenge it. */
  readonly rationale: ReadonlyArray<string>;
}

function addWeight(weights: Weights, category: PriorityCategory, extra: number): void {
  weights[category] = (weights[category] ?? 0) + extra;
}

function applyContextAdjustments(brief: EventBrief, weights: Weights, notes: string[]): void {
  if (brief.venueType !== 'indoor') {
    addWeight(weights, 'logistics', NON_INDOOR_LOGISTICS_EXTRA);
    notes.push(
      `${brief.venueType} venue: extra logistics allowance for shelter, power and weather cover.`,
    );
  }
  if (brief.servesAlcohol) {
    addWeight(weights, 'permits', ALCOHOL_PERMITS_EXTRA);
    notes.push('Alcohol service: extra permits allowance for licences.');
  }
  const needs = brief.accessibilityNeeds.length;
  if (needs > 0) {
    const extra = Math.min(needs * ACCESSIBILITY_LOGISTICS_PER_NEED, ACCESSIBILITY_LOGISTICS_CAP);
    addWeight(weights, 'logistics', extra);
    notes.push(`Accessibility needs (${needs}): extra logistics allowance for access and support.`);
  }
}

function resolvePriorityQuarters(
  brief: EventBrief,
  weights: Weights,
  notes: string[],
): Map<PriorityCategory, number> {
  const quarters = new Map<PriorityCategory, number>();
  brief.priorities.forEach((category, index) => {
    if (weights[category] === undefined) {
      notes.push(
        `"${category}" does not apply to a ${brief.eventType} event, so that priority was ignored.`,
      );
      return;
    }
    quarters.set(category, PRIORITY_QUARTERS_BY_RANK[index] ?? DEFAULT_QUARTERS);
    notes.push(`Prioritised ${category} (rank ${index + 1}): weighted above the default.`);
  });
  return quarters;
}

function toSharePercent(amountMinor: number, totalMinor: number): number {
  return Math.round((amountMinor * 1000) / totalMinor) / 10;
}

/**
 * Splits the total budget across categories using the event-type profile, then adjusts for
 * venue type, alcohol, accessibility needs and the user's ranked priorities. Contingency is
 * reserved first, and the remainder is distributed so lines always sum to the total exactly.
 */
export function allocateBudget(brief: EventBrief): BudgetPlan {
  const profile = BUDGET_PROFILES[brief.eventType];
  const notes: string[] = [`Base split for a ${brief.eventType} event.`];
  const weights: Weights = { ...profile.weights };

  applyContextAdjustments(brief, weights, notes);
  const quarters = resolvePriorityQuarters(brief, weights, notes);

  const contingencyMinor = Math.floor(
    (brief.totalBudgetMinor * profile.contingencyBp) / BASIS_POINTS,
  );
  notes.push(
    `Contingency held at ${profile.contingencyBp / 100}% of the total for price rises and surprises.`,
  );

  const weighted = PRIORITY_CATEGORIES.flatMap((category) => {
    const weight = weights[category];
    return weight === undefined
      ? []
      : [{ key: category, weight: weight * (quarters.get(category) ?? DEFAULT_QUARTERS) }];
  });
  const shares = distributeByLargestRemainder(brief.totalBudgetMinor - contingencyMinor, weighted);

  const lines: BudgetLine[] = [
    ...shares.map((share) => ({ category: share.key, amountMinor: share.amount })),
    { category: 'contingency' as const, amountMinor: contingencyMinor },
  ].map((line) => ({
    ...line,
    sharePercent: toSharePercent(line.amountMinor, brief.totalBudgetMinor),
  }));

  return {
    currency: brief.currency,
    totalMinor: brief.totalBudgetMinor,
    perGuestMinor: Math.floor(brief.totalBudgetMinor / brief.guestCount),
    lines,
    rationale: notes,
  };
}
