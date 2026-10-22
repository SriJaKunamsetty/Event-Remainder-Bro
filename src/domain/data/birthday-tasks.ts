import { NON_INDOOR, weeks, type TaskTemplate } from './task-types';

export const BIRTHDAY_TASKS: ReadonlyArray<TaskTemplate> = [
  {
    id: 'confirm-budget-and-guest-list',
    title: 'Confirm budget and draft the guest list',
    leadDays: weeks(8),
    critical: true,
  },
  {
    id: 'book-venue',
    title: 'Book the venue or reserve the space',
    leadDays: weeks(7),
    critical: true,
  },
  {
    id: 'book-entertainment',
    title: 'Book entertainment or plan activities',
    leadDays: weeks(6),
  },
  {
    id: 'check-alcohol-rules',
    title: 'Check licence rules for serving alcohol',
    leadDays: weeks(4),
    critical: true,
    when: { servesAlcohol: true },
  },
  {
    id: 'order-cake-and-catering',
    title: 'Order the cake and catering',
    leadDays: weeks(4),
    critical: true,
  },
  { id: 'send-invitations', title: 'Send invitations and track RSVPs', leadDays: weeks(4) },
  {
    id: 'check-venue-accessibility',
    title: 'Confirm access and support arrangements',
    leadDays: weeks(3),
    when: { hasAccessibilityNeeds: true },
  },
  {
    id: 'plan-weather-backup',
    title: 'Plan a weather backup',
    leadDays: weeks(3),
    when: { venueTypes: NON_INDOOR },
  },
  {
    id: 'confirm-dietary-needs',
    title: 'Confirm dietary needs with the caterer',
    leadDays: weeks(2),
    when: { hasDietaryNeeds: true },
  },
  { id: 'buy-decor-and-favours', title: 'Buy decor and party favours', leadDays: weeks(2) },
  {
    id: 'confirm-final-headcount',
    title: 'Give the final headcount to venue and caterer',
    leadDays: 7,
    critical: true,
  },
  {
    id: 'reconfirm-vendors',
    title: 'Reconfirm vendors, delivery times and balances',
    leadDays: 2,
  },
];
