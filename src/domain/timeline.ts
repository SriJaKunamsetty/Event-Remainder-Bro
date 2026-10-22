import { addDays, daysBetween } from './dates';
import {
  TIMELINE_TEMPLATES,
  type ConditionInput,
  type TaskCondition,
  type TaskTemplate,
} from './data/timeline-templates';
import { DomainError } from './errors';
import type { EventBrief } from './schemas';

export type TimelineInput = ConditionInput & Pick<EventBrief, 'eventType' | 'eventDate'>;
export type TaskStatus = 'on_track' | 'compressed' | 'due_now';
export type ScheduleRisk = 'none' | 'tight' | 'critical';

export interface TimelineTask {
  readonly id: string;
  readonly title: string;
  readonly dueDate: string;
  readonly idealLeadDays: number;
  readonly actualLeadDays: number;
  readonly critical: boolean;
  readonly status: TaskStatus;
}

export interface Timeline {
  readonly today: string;
  readonly eventDate: string;
  readonly daysUntilEvent: number;
  /** How much the schedule had to be squeezed: none, tight (at least half the ideal lead), critical. */
  readonly risk: ScheduleRisk;
  readonly tasks: ReadonlyArray<TimelineTask>;
}

const CONDITION_CHECKS: ReadonlyArray<(when: TaskCondition, input: ConditionInput) => boolean> = [
  (when, input) => when.venueTypes === undefined || when.venueTypes.includes(input.venueType),
  (when, input) => when.servesAlcohol === undefined || input.servesAlcohol,
  (when, input) => when.minGuests === undefined || input.guestCount >= when.minGuests,
  (when, input) => when.hasDietaryNeeds === undefined || input.dietaryNeeds.length > 0,
  (when, input) => when.hasAccessibilityNeeds === undefined || input.accessibilityNeeds.length > 0,
];

function appliesTo(template: TaskTemplate, input: ConditionInput): boolean {
  const when = template.when;
  return when === undefined || CONDITION_CHECKS.every((check) => check(when, input));
}

/**
 * When there is less time than the longest lead requires, every lead is scaled by the same
 * ratio. Uniform scaling keeps the original order (venue before caterer before invitations)
 * instead of letting a short task leapfrog a long one.
 */
function scheduledLead(idealLead: number, available: number, longestLead: number): number {
  if (available >= longestLead) {
    return idealLead;
  }
  const scaled = Math.floor((idealLead * available) / longestLead);
  return Math.min(available, Math.max(1, scaled));
}

function classifyRisk(available: number, longestLead: number): ScheduleRisk {
  if (available >= longestLead) {
    return 'none';
  }
  return available * 2 >= longestLead ? 'tight' : 'critical';
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareTasks(a: TimelineTask, b: TimelineTask): number {
  return (
    compareText(a.dueDate, b.dueDate) ||
    Number(b.critical) - Number(a.critical) ||
    b.idealLeadDays - a.idealLeadDays ||
    compareText(a.id, b.id)
  );
}

/**
 * Builds a back-scheduled task list from the event date. `today` is injected rather than read
 * from the system clock, which keeps the function pure and its tests deterministic.
 */
export function buildTimeline(input: TimelineInput, today: string): Timeline {
  const available = daysBetween(today, input.eventDate);
  if (available < 0) {
    throw new DomainError('EVENT_IN_PAST', `Event date ${input.eventDate} is before ${today}.`);
  }

  const templates = TIMELINE_TEMPLATES[input.eventType].filter((t) => appliesTo(t, input));
  const longestLead = Math.max(...templates.map((template) => template.leadDays));

  const tasks = templates
    .map((template): TimelineTask => {
      const actualLead = scheduledLead(template.leadDays, available, longestLead);
      const dueDate = addDays(input.eventDate, -actualLead);
      const status: TaskStatus =
        dueDate === today
          ? 'due_now'
          : actualLead === template.leadDays
            ? 'on_track'
            : 'compressed';
      return {
        id: template.id,
        title: template.title,
        dueDate,
        idealLeadDays: template.leadDays,
        actualLeadDays: actualLead,
        critical: template.critical === true,
        status,
      };
    })
    .sort(compareTasks);

  return {
    today,
    eventDate: input.eventDate,
    daysUntilEvent: available,
    risk: classifyRisk(available, longestLead),
    tasks,
  };
}
