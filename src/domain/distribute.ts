import { DomainError } from './errors';

export interface WeightedKey<K extends string> {
  readonly key: K;
  readonly weight: number;
}

export interface Share<K extends string> {
  readonly key: K;
  readonly amount: number;
}

/**
 * Splits an integer `total` across weighted keys so the parts sum to `total` exactly.
 * Each key gets the floor of its exact share; leftover units go to the largest fractional
 * remainders, with ties resolved by input order so the result is fully deterministic.
 */
export function distributeByLargestRemainder<K extends string>(
  total: number,
  items: ReadonlyArray<WeightedKey<K>>,
): ReadonlyArray<Share<K>> {
  assertValidInput(total, items);
  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);

  const drafts = items.map((item, index) => {
    const exact = total * item.weight;
    return {
      key: item.key,
      index,
      floor: Math.floor(exact / weightSum),
      remainder: exact % weightSum,
    };
  });

  const floorTotal = drafts.reduce((sum, draft) => sum + draft.floor, 0);
  const leftover = total - floorTotal;
  const bonusIndexes = new Set(
    [...drafts]
      .sort((a, b) => b.remainder - a.remainder || a.index - b.index)
      .slice(0, leftover)
      .map((draft) => draft.index),
  );

  return drafts.map((draft) => ({
    key: draft.key,
    amount: draft.floor + (bonusIndexes.has(draft.index) ? 1 : 0),
  }));
}

function assertValidInput<K extends string>(
  total: number,
  items: ReadonlyArray<WeightedKey<K>>,
): void {
  if (!Number.isSafeInteger(total) || total < 0) {
    throw new DomainError('INVALID_AMOUNT', 'Total must be a non-negative safe integer.');
  }
  if (items.length === 0) {
    throw new DomainError('INVALID_AMOUNT', 'At least one item is required to distribute a total.');
  }
  const maxWeight = Math.max(...items.map((item) => item.weight));
  const allPositiveIntegers = items.every(
    (item) => Number.isSafeInteger(item.weight) && item.weight > 0,
  );
  if (!allPositiveIntegers || !Number.isSafeInteger(total * maxWeight)) {
    throw new DomainError('INVALID_AMOUNT', 'Weights must be positive integers within safe range.');
  }
}
