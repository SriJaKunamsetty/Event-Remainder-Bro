import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { briefArbitrary, makeBrief } from './__fixtures__/briefs';
import { allocateBudget, type BudgetPlan } from './budget';
import { BUDGET_PROFILES } from './data/budget-profiles';
import { BUDGET_CATEGORIES, EVENT_TYPES, type BudgetCategory } from './schemas';

const amountOf = (plan: BudgetPlan, category: BudgetCategory): number =>
  plan.lines.find((line) => line.category === category)?.amountMinor ?? 0;
const sumOf = (plan: BudgetPlan): number => plan.lines.reduce((sum, l) => sum + l.amountMinor, 0);

describe('allocateBudget', () => {
  it.each(EVENT_TYPES)('sums exactly to the total for a %s', (eventType) => {
    for (const totalBudgetMinor of [1, 99, 1_000_001, 50_000_000, 987_654_321]) {
      const plan = allocateBudget(makeBrief({ eventType, totalBudgetMinor }));
      expect(sumOf(plan)).toBe(totalBudgetMinor);
    }
  });

  it('holds back contingency from the profile before splitting the rest', () => {
    for (const eventType of EVENT_TYPES) {
      const plan = allocateBudget(makeBrief({ eventType, totalBudgetMinor: 50_000_000 }));
      const expected = Math.floor((50_000_000 * BUDGET_PROFILES[eventType].contingencyBp) / 10_000);
      expect(amountOf(plan, 'contingency')).toBe(expected);
    }
  });

  it('reports per-guest spend rounded down and shares that reflect the lines', () => {
    const plan = allocateBudget(makeBrief({ guestCount: 150, totalBudgetMinor: 50_000_000 }));
    expect(plan.perGuestMinor).toBe(Math.floor(50_000_000 / 150));
    const catering = plan.lines.find((line) => line.category === 'catering');
    expect(catering?.sharePercent).toBeGreaterThan(20);
    expect(plan.currency).toBe('INR');
  });

  it('lists categories in a stable order with contingency last', () => {
    const plan = allocateBudget(makeBrief());
    const order = plan.lines.map((line) => line.category);
    expect(order.at(-1)).toBe('contingency');
    expect(order).toEqual(BUDGET_CATEGORIES.filter((category) => order.includes(category)));
  });

  it('omits categories that do not apply to the event type', () => {
    const plan = allocateBudget(makeBrief({ eventType: 'community' }));
    expect(plan.lines.some((line) => line.category === 'attire')).toBe(false);
  });

  describe('context adjustments', () => {
    it('gives a prioritised category a larger share than the default split', () => {
      const base = allocateBudget(makeBrief());
      const boosted = allocateBudget(makeBrief({ priorities: ['photography'] }));
      expect(amountOf(boosted, 'photography')).toBeGreaterThan(amountOf(base, 'photography'));
    });

    it('weights a first-ranked priority above the same category ranked third', () => {
      const first = allocateBudget(makeBrief({ priorities: ['catering'] }));
      const third = allocateBudget(makeBrief({ priorities: ['venue', 'decor', 'catering'] }));
      expect(amountOf(first, 'catering')).toBeGreaterThan(amountOf(third, 'catering'));
    });

    it('treats hybrid like outdoor and both above indoor for logistics', () => {
      const indoor = allocateBudget(makeBrief({ venueType: 'indoor' }));
      const outdoor = allocateBudget(makeBrief({ venueType: 'outdoor' }));
      const hybrid = allocateBudget(makeBrief({ venueType: 'hybrid' }));
      expect(amountOf(outdoor, 'logistics')).toBeGreaterThan(amountOf(indoor, 'logistics'));
      expect(amountOf(hybrid, 'logistics')).toBe(amountOf(outdoor, 'logistics'));
    });

    it('raises the permits allowance when alcohol is served', () => {
      const dry = allocateBudget(makeBrief());
      const wet = allocateBudget(makeBrief({ servesAlcohol: true }));
      expect(amountOf(wet, 'permits')).toBeGreaterThan(amountOf(dry, 'permits'));
    });

    it('raises logistics with accessibility needs, up to a cap', () => {
      const none = allocateBudget(makeBrief());
      const one = allocateBudget(makeBrief({ accessibilityNeeds: ['wheelchair_access'] }));
      const four = allocateBudget(
        makeBrief({
          accessibilityNeeds: [
            'wheelchair_access',
            'step_free_route',
            'hearing_support',
            'visual_support',
          ],
        }),
      );
      const six = allocateBudget(
        makeBrief({
          accessibilityNeeds: [
            'wheelchair_access',
            'step_free_route',
            'hearing_support',
            'visual_support',
            'quiet_space',
            'seating_for_elderly',
          ],
        }),
      );
      expect(amountOf(one, 'logistics')).toBeGreaterThan(amountOf(none, 'logistics'));
      expect(amountOf(four, 'logistics')).toBeGreaterThan(amountOf(one, 'logistics'));
      expect(amountOf(six, 'logistics')).toBe(amountOf(four, 'logistics'));
    });

    it('ignores a priority that does not apply and says so', () => {
      const plain = allocateBudget(makeBrief({ eventType: 'community' }));
      const ignored = allocateBudget(makeBrief({ eventType: 'community', priorities: ['attire'] }));
      expect(ignored.lines).toEqual(plain.lines);
      expect(ignored.rationale.some((note) => note.includes('does not apply'))).toBe(true);
    });
  });

  describe('rationale', () => {
    it('explains the base split, contingency and every active adjustment', () => {
      const plan = allocateBudget(
        makeBrief({
          venueType: 'outdoor',
          servesAlcohol: true,
          accessibilityNeeds: ['quiet_space'],
          priorities: ['decor'],
        }),
      );
      const text = plan.rationale.join('\n');
      expect(text).toContain('Base split for a wedding');
      expect(text).toContain('outdoor venue');
      expect(text).toContain('Alcohol service');
      expect(text).toContain('Accessibility needs (1)');
      expect(text).toContain('Prioritised decor (rank 1)');
      expect(text).toContain('Contingency held at 10%');
    });
  });

  it('copes with the smallest possible budget', () => {
    const plan = allocateBudget(makeBrief({ totalBudgetMinor: 1, guestCount: 5_000 }));
    expect(sumOf(plan)).toBe(1);
    expect(plan.perGuestMinor).toBe(0);
  });

  it('is deterministic and never mutates its input', () => {
    const brief = makeBrief({
      priorities: ['venue', 'decor'],
      accessibilityNeeds: ['quiet_space'],
    });
    Object.freeze(brief.priorities);
    Object.freeze(brief.accessibilityNeeds);
    Object.freeze(brief);
    expect(allocateBudget(brief)).toEqual(allocateBudget(brief));
  });

  it('holds its invariants for any valid brief', () => {
    fc.assert(
      fc.property(briefArbitrary, (brief) => {
        const plan = allocateBudget(brief);
        expect(sumOf(plan)).toBe(brief.totalBudgetMinor);
        expect(
          plan.lines.every((line) => Number.isInteger(line.amountMinor) && line.amountMinor >= 0),
        ).toBe(true);
        expect(new Set(plan.lines.map((line) => line.category)).size).toBe(plan.lines.length);
      }),
    );
  });
});

describe('budget profiles', () => {
  it.each(EVENT_TYPES)(
    '%s defines the logistics and permits weights that context adjustments build on',
    (eventType) => {
      const { weights, contingencyBp } = BUDGET_PROFILES[eventType];
      expect(weights.logistics).toBeGreaterThan(0);
      expect(weights.permits).toBeGreaterThan(0);
      expect(contingencyBp).toBeGreaterThanOrEqual(500);
      expect(contingencyBp).toBeLessThanOrEqual(2500);
      expect(Object.values(weights).every((w) => Number.isInteger(w) && w > 0)).toBe(true);
    },
  );
});
