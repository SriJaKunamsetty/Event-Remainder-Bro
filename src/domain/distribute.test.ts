import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { distributeByLargestRemainder } from './distribute';
import { DomainError } from './errors';

const amounts = (total: number, weights: number[]): number[] =>
  distributeByLargestRemainder(
    total,
    weights.map((weight, index) => ({ key: `k${index}`, weight })),
  ).map((share) => share.amount);

describe('distributeByLargestRemainder', () => {
  it('splits exactly when the total divides evenly', () => {
    expect(amounts(100, [1, 1, 1, 1])).toEqual([25, 25, 25, 25]);
  });

  it('gives leftover units to the largest remainders, ties by input order', () => {
    expect(amounts(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(amounts(10, [1, 2])).toEqual([3, 7]);
    expect(amounts(5, [3, 1, 1])).toEqual([3, 1, 1]);
  });

  it('preserves input keys and order', () => {
    const result = distributeByLargestRemainder(9, [
      { key: 'a', weight: 1 },
      { key: 'b', weight: 2 },
    ]);
    expect(result).toEqual([
      { key: 'a', amount: 3 },
      { key: 'b', amount: 6 },
    ]);
  });

  it('handles a zero total', () => {
    expect(amounts(0, [2, 3])).toEqual([0, 0]);
  });

  it('always sums to the total and stays within one unit of the exact share', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100_000_000_000 }),
        fc.array(fc.integer({ min: 1, max: 800 }), { minLength: 1, maxLength: 12 }),
        (total, weights) => {
          const result = amounts(total, weights);
          const weightSum = weights.reduce((a, b) => a + b, 0);
          expect(result.reduce((a, b) => a + b, 0)).toBe(total);
          result.forEach((amount, index) => {
            const exact = (total * (weights[index] ?? 0)) / weightSum;
            expect(amount).toBeGreaterThanOrEqual(Math.floor(exact) - 1e-6);
            expect(amount).toBeLessThanOrEqual(Math.ceil(exact) + 1e-6);
          });
        },
      ),
    );
  });

  it.each([
    ['a negative total', -1, [1]],
    ['a fractional total', 1.5, [1]],
    ['no items', 10, []],
    ['a zero weight', 10, [1, 0]],
    ['a fractional weight', 10, [1, 0.5]],
    ['an unsafe product', Number.MAX_SAFE_INTEGER, [2]],
  ])('rejects %s', (_label, total, weights) => {
    expect(() => amounts(total, weights)).toThrowError(DomainError);
  });
});
