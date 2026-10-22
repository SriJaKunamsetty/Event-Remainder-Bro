import type { EventType } from '../schemas';
import { BIRTHDAY_TASKS } from './birthday-tasks';
import { COMMUNITY_TASKS } from './community-tasks';
import type { TaskTemplate } from './task-types';
import { WEDDING_TASKS } from './wedding-tasks';

export type { ConditionInput, TaskCondition, TaskTemplate } from './task-types';

/**
 * Task templates per event type, kept as data so they can be reviewed and tuned without
 * touching scheduling logic. Lead times are ideal days before the event.
 */
export const TIMELINE_TEMPLATES: Readonly<Record<EventType, ReadonlyArray<TaskTemplate>>> = {
  wedding: WEDDING_TASKS,
  birthday: BIRTHDAY_TASKS,
  community: COMMUNITY_TASKS,
};
