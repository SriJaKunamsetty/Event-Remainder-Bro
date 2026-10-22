import { addDays, isoToEpochDay } from './dates';

export interface CalendarEventParams {
  readonly title: string;
  readonly description: string;
  readonly eventDate: string;
  readonly location?: string;
}

function cleanIsoToBasic(iso: string): string {
  // Validate that iso is a real calendar date before converting
  isoToEpochDay(iso);
  return iso.replace(/-/g, '');
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string for importing into
 * Apple Calendar, Outlook, and Google Calendar.
 */
export function generateIcsCalendar(params: CalendarEventParams): string {
  const dtStart = cleanIsoToBasic(params.eventDate);
  const nextDayIso = addDays(params.eventDate, 1);
  const dtEnd = cleanIsoToBasic(nextDayIso);
  const escapedDescription = params.description
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
  const escapedLocation = (params.location ?? 'Event Venue')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventCraft//Celebration Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${dtStart}-${Date.now()}@eventcraft.app`,
    `DTSTAMP:${dtStart}T000000Z`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${escapedDescription}`,
    `LOCATION:${escapedLocation}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates a direct Google Calendar template URL so users can add the event
 * with one click without downloading files.
 */
export function generateGoogleCalendarUrl(params: CalendarEventParams): string {
  const dtStart = cleanIsoToBasic(params.eventDate);
  const nextDayIso = addDays(params.eventDate, 1);
  const dtEnd = cleanIsoToBasic(nextDayIso);

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${dtStart}/${dtEnd}`,
    details: params.description,
    location: params.location ?? 'Event Venue',
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
