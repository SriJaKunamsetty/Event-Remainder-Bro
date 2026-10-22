import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { briefArbitrary, makeBrief } from './__fixtures__/briefs';
import { TIMELINE_TEMPLATES } from './data/timeline-templates';
import { addDays, epochDayToIso } from './dates';
import { DomainError } from './errors';
import { EVENT_TYPES, type EventBrief } from './schemas';
import { buildTimeline } from './timeline';

const TODAY = '2026-10-21';
const taskIds = (brief: EventBrief, today = TODAY): string[] =>
  buildTimeline(brief, today).tasks.map((task) => task.id);

function errorCodeOf(action: () => unknown): string | undefined {
  try {
    action();
  } catch (error) {
    return error instanceof DomainError ? error.code : undefined;
  }
  return undefined;
}

describe('buildTimeline', () => {
  describe('with plenty of time', () => {
    it('schedules every task at its ideal lead and flags no risk', () => {
      const timeline = buildTimeline(makeBrief({ eventDate: '2027-10-21' }), TODAY);
      expect(timeline.risk).toBe('none');
      expect(timeline.daysUntilEvent).toBe(365);
      expect(timeline.tasks.every((task) => task.status === 'on_track')).toBe(true);
      expect(timeline.tasks.every((task) => task.actualLeadDays === task.idealLeadDays)).toBe(true);
    });

    it('marks a task due today when its lead equals the time available', () => {
      const timeline = buildTimeline(makeBrief({ eventDate: '2027-10-20' }), TODAY);
      expect(timeline.risk).toBe('none');
      expect(timeline.tasks[0]).toMatchObject({
        id: 'confirm-budget-and-guest-list',
        dueDate: TODAY,
        status: 'due_now',
      });
    });
  });

  describe('when time is short', () => {
    it('compresses every lead proportionally and keeps tasks inside the window', () => {
      const eventDate = addDays(TODAY, 90);
      const timeline = buildTimeline(makeBrief({ eventDate }), TODAY);
      expect(timeline.risk).toBe('critical');
      expect(timeline.tasks.some((task) => task.status === 'compressed')).toBe(true);
      for (const task of timeline.tasks) {
        expect(task.dueDate >= TODAY && task.dueDate <= eventDate).toBe(true);
      }
    });

    it('reports a tight schedule when at least half the ideal lead remains', () => {
      expect(buildTimeline(makeBrief({ eventDate: addDays(TODAY, 200) }), TODAY).risk).toBe(
        'tight',
      );
    });

    it('treats an event today as critical with everything due now', () => {
      const timeline = buildTimeline(makeBrief({ eventDate: TODAY }), TODAY);
      expect(timeline.risk).toBe('critical');
      expect(timeline.tasks.every((task) => task.status === 'due_now')).toBe(true);
    });

    it('preserves the original order of dependent tasks', () => {
      const { tasks } = buildTimeline(makeBrief({ eventDate: addDays(TODAY, 45) }), TODAY);
      const dueOf = (id: string): string => tasks.find((task) => task.id === id)?.dueDate ?? '';
      expect(dueOf('book-venue') <= dueOf('book-caterer')).toBe(true);
      expect(dueOf('book-caterer') <= dueOf('send-invitations')).toBe(true);
    });
  });

  describe('conditional tasks', () => {
    const eventDate = '2027-10-21';
    it('adds the alcohol licence only when alcohol is served', () => {
      expect(taskIds(makeBrief({ eventDate }))).not.toContain('apply-alcohol-licence');
      expect(taskIds(makeBrief({ eventDate, servesAlcohol: true }))).toContain(
        'apply-alcohol-licence',
      );
    });

    it('adds a weather backup for outdoor and hybrid venues, not indoor', () => {
      expect(taskIds(makeBrief({ eventDate, venueType: 'indoor' }))).not.toContain(
        'plan-weather-backup',
      );
      expect(taskIds(makeBrief({ eventDate, venueType: 'outdoor' }))).toContain(
        'plan-weather-backup',
      );
      expect(taskIds(makeBrief({ eventDate, venueType: 'hybrid' }))).toContain(
        'plan-weather-backup',
      );
    });

    it('adds dietary and accessibility steps only when those needs exist', () => {
      const plain = taskIds(makeBrief({ eventDate }));
      const needy = taskIds(
        makeBrief({
          eventDate,
          dietaryNeeds: ['halal'],
          accessibilityNeeds: ['wheelchair_access'],
        }),
      );
      expect(plain).not.toContain('hold-menu-tasting');
      expect(plain).not.toContain('check-venue-accessibility');
      expect(needy).toContain('hold-menu-tasting');
      expect(needy).toContain('check-venue-accessibility');
    });

    it('adds guest transport only for larger weddings', () => {
      expect(taskIds(makeBrief({ eventDate, guestCount: 99 }))).not.toContain(
        'arrange-guest-transport',
      );
      expect(taskIds(makeBrief({ eventDate, guestCount: 100 }))).toContain(
        'arrange-guest-transport',
      );
    });
  });

  it('orders tasks by due date, then critical first, then longest lead', () => {
    const { tasks } = buildTimeline(makeBrief({ eventDate: addDays(TODAY, 120) }), TODAY);
    for (let i = 1; i < tasks.length; i += 1) {
      const [a, b] = [tasks[i - 1], tasks[i]];
      if (a === undefined || b === undefined) throw new Error('unreachable');
      expect(a.dueDate <= b.dueDate).toBe(true);
      if (a.dueDate === b.dueDate) {
        expect(Number(a.critical) >= Number(b.critical)).toBe(true);
        if (a.critical === b.critical) expect(a.idealLeadDays >= b.idealLeadDays).toBe(true);
      }
    }
  });

  it('rejects an event in the past with a typed error', () => {
    expect(errorCodeOf(() => buildTimeline(makeBrief({ eventDate: '2026-10-20' }), TODAY))).toBe(
      'EVENT_IN_PAST',
    );
  });

  it('rejects a malformed "today" with a typed error', () => {
    expect(errorCodeOf(() => buildTimeline(makeBrief(), '21/10/2026'))).toBe('INVALID_DATE');
  });

  it('holds its invariants for any valid brief and date window', () => {
    fc.assert(
      fc.property(
        briefArbitrary,
        fc.integer({ min: 20_000, max: 25_000 }),
        fc.integer({ min: 0, max: 800 }),
        (brief, todayEpochDay, daysAhead) => {
          const today = epochDayToIso(todayEpochDay);
          const eventDate = addDays(today, daysAhead);
          const { tasks } = buildTimeline({ ...brief, eventDate }, today);

          expect(tasks.length).toBeGreaterThan(0);
          for (const task of tasks) {
            expect(task.dueDate >= today && task.dueDate <= eventDate).toBe(true);
            expect(task.actualLeadDays).toBeLessThanOrEqual(task.idealLeadDays);
          }
          // A longer ideal lead never ends up scheduled later than a shorter one.
          for (const a of tasks) {
            for (const b of tasks) {
              if (a.idealLeadDays > b.idealLeadDays) {
                expect(a.actualLeadDays).toBeGreaterThanOrEqual(b.actualLeadDays);
              }
            }
          }
        },
      ),
    );
  });
});

describe('timeline templates', () => {
  it.each(EVENT_TYPES)(
    '%s has unique ids, positive integer leads and a critical task',
    (eventType) => {
      const templates = TIMELINE_TEMPLATES[eventType];
      expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length);
      expect(templates.every((t) => Number.isInteger(t.leadDays) && t.leadDays > 0)).toBe(true);
      expect(templates.some((t) => t.critical === true)).toBe(true);
    },
  );
});
