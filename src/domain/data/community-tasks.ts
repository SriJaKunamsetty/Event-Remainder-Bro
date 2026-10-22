import { NON_INDOOR, weeks, type TaskTemplate } from './task-types';

export const COMMUNITY_TASKS: ReadonlyArray<TaskTemplate> = [
  {
    id: 'define-goals-and-budget',
    title: 'Define goals, audience and budget',
    leadDays: weeks(16),
    critical: true,
  },
  { id: 'secure-site', title: 'Secure the site or venue', leadDays: weeks(14), critical: true },
  {
    id: 'apply-permits-and-insurance',
    title: 'Apply for event permits and liability insurance',
    leadDays: weeks(12),
    critical: true,
  },
  { id: 'recruit-volunteers', title: 'Recruit volunteers and assign roles', leadDays: weeks(10) },
  {
    id: 'approach-sponsors',
    title: 'Approach sponsors and local partners',
    leadDays: weeks(10),
    when: { minGuests: 100 },
  },
  {
    id: 'apply-alcohol-licence',
    title: 'Apply for a temporary alcohol licence',
    leadDays: weeks(8),
    critical: true,
    when: { servesAlcohol: true },
  },
  {
    id: 'audit-site-accessibility',
    title: 'Audit the site for access: routes, toilets and seating',
    leadDays: weeks(8),
  },
  {
    id: 'book-sound-seating-sanitation',
    title: 'Book sound, seating and sanitation',
    leadDays: weeks(6),
  },
  { id: 'check-food-vendor-licences', title: 'Check food vendor licences', leadDays: weeks(6) },
  { id: 'publicise-event', title: 'Publicise the event', leadDays: weeks(6) },
  {
    id: 'plan-weather-and-crowd-flow',
    title: 'Plan for weather and crowd flow',
    leadDays: weeks(5),
    when: { venueTypes: NON_INDOOR },
  },
  {
    id: 'confirm-dietary-options',
    title: 'Make sure food options cover dietary needs',
    leadDays: weeks(4),
    when: { hasDietaryNeeds: true },
  },
  {
    id: 'reconfirm-vendors',
    title: 'Reconfirm vendors, arrival times and balances',
    leadDays: 7,
  },
  { id: 'brief-volunteers', title: 'Brief volunteers and walk the site', leadDays: 3 },
];
