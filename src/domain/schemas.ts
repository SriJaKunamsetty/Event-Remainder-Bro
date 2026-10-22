import { z } from 'zod';
import { isValidIsoDate } from './dates';

export const EVENT_TYPES = ['wedding', 'birthday', 'community'] as const;
export const VENUE_TYPES = ['indoor', 'outdoor', 'hybrid'] as const;

/** Categories a user may ask us to favour. Contingency is deliberately excluded. */
export const PRIORITY_CATEGORIES = [
  'venue',
  'catering',
  'decor',
  'entertainment',
  'photography',
  'attire',
  'invitations',
  'logistics',
  'permits',
] as const;
export const BUDGET_CATEGORIES = [...PRIORITY_CATEGORIES, 'contingency'] as const;

export const DIETARY_NEEDS = [
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'jain',
  'gluten_free',
  'nut_allergy',
  'dairy_free',
] as const;
export const ACCESSIBILITY_NEEDS = [
  'wheelchair_access',
  'step_free_route',
  'hearing_support',
  'visual_support',
  'quiet_space',
  'seating_for_elderly',
] as const;
export const PLANNER_EXPERIENCE = ['first_time', 'experienced'] as const;

export const MAX_GUESTS = 5_000;
/**
 * 1e11 minor units keeps every intermediate product (amount x basis points x weights)
 * below Number.MAX_SAFE_INTEGER, so integer maths stays exact without BigInt.
 */
export const MAX_BUDGET_MINOR = 100_000_000_000;
export const MAX_NOTES_LENGTH = 500;

export type EventType = (typeof EVENT_TYPES)[number];
export type VenueType = (typeof VENUE_TYPES)[number];
export type PriorityCategory = (typeof PRIORITY_CATEGORIES)[number];
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
export type DietaryNeed = (typeof DIETARY_NEEDS)[number];
export type AccessibilityNeed = (typeof ACCESSIBILITY_NEEDS)[number];
export type PlannerExperience = (typeof PLANNER_EXPERIENCE)[number];

const uniqueList = <T extends z.ZodType>(item: T, max: number) =>
  z
    .array(item)
    .max(max)
    .refine((list) => new Set(list).size === list.length, 'Items must be unique.');

/**
 * The single source of truth for what a planning request may contain.
 * `strictObject` rejects unknown keys, and every field has an upper bound, so a hostile or
 * malformed payload is rejected before any logic (or any model call) runs.
 */
export const EventBriefSchema = z.strictObject({
  eventType: z.enum(EVENT_TYPES),
  eventDate: z.string().refine(isValidIsoDate, 'Use a real date in YYYY-MM-DD format.'),
  guestCount: z.number().int().min(1).max(MAX_GUESTS),
  totalBudgetMinor: z.number().int().positive().max(MAX_BUDGET_MINOR),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO 4217 code such as INR.'),
  venueType: z.enum(VENUE_TYPES),
  priorities: uniqueList(z.enum(PRIORITY_CATEGORIES), 3).default([]),
  servesAlcohol: z.boolean().default(false),
  dietaryNeeds: uniqueList(z.enum(DIETARY_NEEDS), DIETARY_NEEDS.length).default([]),
  accessibilityNeeds: uniqueList(z.enum(ACCESSIBILITY_NEEDS), ACCESSIBILITY_NEEDS.length).default(
    [],
  ),
  plannerExperience: z.enum(PLANNER_EXPERIENCE).default('first_time'),
  notes: z.string().trim().max(MAX_NOTES_LENGTH).optional(),
});

export type EventBrief = z.infer<typeof EventBriefSchema>;
