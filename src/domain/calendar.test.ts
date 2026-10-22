import { describe, it, expect } from 'vitest';
import { generateIcsCalendar, generateGoogleCalendarUrl } from './calendar';

describe('generateIcsCalendar', () => {
  it('generates a valid RFC 5545 iCalendar payload', () => {
    const ics = generateIcsCalendar({
      title: 'Our Wedding Celebration',
      description: 'Sunset ceremony and dinner with 150 guests.',
      eventDate: '2027-06-12',
      location: 'Grand Ballroom',
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270612');
    expect(ics).toContain('DTEND;VALUE=DATE:20270613');
    expect(ics).toContain('SUMMARY:Our Wedding Celebration');
    expect(ics).toContain('LOCATION:Grand Ballroom');
    expect(ics).toContain('END:VCALENDAR');
  });
});

describe('generateGoogleCalendarUrl', () => {
  it('generates a valid Google Calendar URL with query parameters', () => {
    const url = generateGoogleCalendarUrl({
      title: 'Our Wedding Celebration',
      description: 'Sunset ceremony and dinner with 150 guests.',
      eventDate: '2027-06-12',
      location: 'Grand Ballroom',
    });

    expect(url).toContain('https://calendar.google.com/calendar/render?');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('dates=20270612%2F20270613');
    expect(url).toContain('Our+Wedding+Celebration');
  });
});
