import type { EventBrief, VenueType } from '../schemas';

/** Every specified condition must hold for a task to apply. Omitted conditions are ignored. */
export interface TaskCondition {
  readonly venueTypes?: ReadonlyArray<VenueType>;
  readonly servesAlcohol?: true;
  readonly minGuests?: number;
  readonly hasDietaryNeeds?: true;
  readonly hasAccessibilityNeeds?: true;
}

export interface TaskTemplate {
  readonly id: string;
  readonly title: string;
  /** How many days before the event this task should ideally be finished. */
  readonly leadDays: number;
  readonly critical?: boolean;
  readonly when?: TaskCondition;
}

export type ConditionInput = Pick<
  EventBrief,
  'venueType' | 'servesAlcohol' | 'guestCount' | 'dietaryNeeds' | 'accessibilityNeeds'
>;

export const weeks = (count: number): number => count * 7;
export const NON_INDOOR: ReadonlyArray<VenueType> = ['outdoor', 'hybrid'];
