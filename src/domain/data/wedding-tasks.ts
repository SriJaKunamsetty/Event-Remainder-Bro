import { NON_INDOOR, weeks, type TaskTemplate } from './task-types';

export const WEDDING_TASKS: ReadonlyArray<TaskTemplate> = [
  {
    id: 'confirm-budget-and-guest-list',
    title: 'Confirm budget and draft the guest list',
    leadDays: weeks(52),
    critical: true,
  },
  {
    id: 'book-venue',
    title: 'Book the venue and pay the deposit',
    leadDays: weeks(48),
    critical: true,
  },
  {
    id: 'book-caterer',
    title: 'Book the caterer and fix the menu style',
    leadDays: weeks(40),
    critical: true,
  },
  { id: 'book-photographer', title: 'Book photographer and videographer', leadDays: weeks(36) },
  { id: 'book-entertainment', title: 'Book music and entertainment', leadDays: weeks(32) },
  {
    id: 'order-attire',
    title: 'Choose and order attire, allowing for fittings',
    leadDays: weeks(28),
  },
  { id: 'send-save-the-dates', title: 'Send save-the-dates', leadDays: weeks(24) },
  { id: 'book-decor', title: 'Book decor and florist', leadDays: weeks(20) },
  {
    id: 'arrange-guest-transport',
    title: 'Arrange guest transport and stays',
    leadDays: weeks(16),
    when: { minGuests: 100 },
  },
  {
    id: 'check-venue-accessibility',
    title: 'Confirm access and support arrangements with the venue',
    leadDays: weeks(12),
    when: { hasAccessibilityNeeds: true },
  },
  {
    id: 'apply-alcohol-licence',
    title: 'Apply for the alcohol licence or permit',
    leadDays: weeks(12),
    critical: true,
    when: { servesAlcohol: true },
  },
  {
    id: 'plan-weather-backup',
    title: 'Plan a weather backup (tent or indoor fallback)',
    leadDays: weeks(10),
    when: { venueTypes: NON_INDOOR },
  },
  { id: 'send-invitations', title: 'Send invitations and open RSVPs', leadDays: weeks(8) },
  {
    id: 'hold-menu-tasting',
    title: 'Hold the menu tasting and confirm dietary needs',
    leadDays: weeks(6),
    when: { hasDietaryNeeds: true },
  },
  {
    id: 'confirm-final-headcount',
    title: 'Give the final headcount to caterer and venue',
    leadDays: weeks(2),
    critical: true,
  },
  {
    id: 'reconfirm-vendors',
    title: 'Reconfirm every vendor, arrival time and balance due',
    leadDays: 7,
  },
  {
    id: 'finalise-run-of-show',
    title: 'Finalise the run-of-show and share it with helpers',
    leadDays: 2,
  },
];
