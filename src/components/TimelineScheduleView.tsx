'use client';

import type { EventBrief } from '@/domain/schemas';
import type { Timeline, TimelineTask } from '@/domain/timeline';
import {
  generateGoogleCalendarUrl,
  generateIcsCalendar,
  type CalendarEventParams,
} from '@/domain/calendar';

function downloadIcsCalendar(params: CalendarEventParams): void {
  const ics = generateIcsCalendar(params);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'EventCraft_Celebration.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CalendarActionButtons({
  timeline,
  brief,
}: {
  readonly timeline: Timeline;
  readonly brief?: EventBrief;
}) {
  const eventTitle = brief
    ? `${brief.eventType.toUpperCase()} Celebration (${brief.guestCount} Guests)`
    : `Celebration Event`;
  const description = brief
    ? `EventCraft Celebration Plan: ${brief.guestCount} guests, ${brief.venueType} venue. Date: ${timeline.eventDate}.`
    : `EventCraft Celebration on ${timeline.eventDate}`;
  const location = brief ? `${brief.venueType.toUpperCase()} Venue` : 'Event Venue';

  const params: CalendarEventParams = {
    title: eventTitle,
    description,
    eventDate: timeline.eventDate,
    location,
  };

  const googleCalUrl = generateGoogleCalendarUrl(params);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={googleCalUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Add celebration event to Google Calendar"
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 focus:outline-2 focus:outline-blue-700 min-h-[44px]"
      >
        <span>📅</span>
        <span>Google Calendar</span>
      </a>
      <button
        type="button"
        onClick={() => downloadIcsCalendar(params)}
        aria-label="Download Apple or Outlook iCalendar (.ics) file"
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50 focus:outline-2 focus:outline-blue-700 min-h-[44px]"
      >
        <span>📥</span>
        <span>Download .ICS</span>
      </button>
    </div>
  );
}

function TimelineTaskItem({ task }: { readonly task: TimelineTask }) {
  const isCompressed = task.status === 'compressed';
  const isDueNow = task.status === 'due_now';

  return (
    <article className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 hover:bg-neutral-100/60 transition-colors">
      <div className="flex items-start gap-2.5">
        {task.critical && (
          <span
            title="Critical Milestone"
            className="mt-0.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800 border border-red-300"
          >
            CRITICAL
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{task.title}</h3>
          <p className="text-xs text-neutral-500">
            Ideal lead: {task.idealLeadDays} days | Scheduled lead: {task.actualLeadDays} days
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="text-xs font-mono font-medium text-neutral-800">
          Due: <strong>{task.dueDate}</strong>
        </span>
        {isDueNow && (
          <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
            DUE NOW
          </span>
        )}
        {isCompressed && (
          <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
            COMPRESSED
          </span>
        )}
      </div>
    </article>
  );
}

export const TimelineScheduleView = ({
  timeline,
  brief,
}: {
  readonly timeline: Timeline;
  readonly brief?: EventBrief;
}) => {
  const riskBadgeStyles: Record<Timeline['risk'], { bg: string; label: string }> = {
    none: { bg: 'bg-green-100 text-green-900 border-green-300', label: 'Feasible (On Track)' },
    tight: { bg: 'bg-amber-100 text-amber-900 border-amber-300', label: 'Tight Timeline' },
    critical: { bg: 'bg-red-100 text-red-900 border-red-300', label: 'Critical Compression' },
  };

  const risk = riskBadgeStyles[timeline.risk];

  return (
    <section
      aria-labelledby="timeline-heading"
      className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h2 id="timeline-heading" className="text-xl font-bold text-neutral-900">
            Backward-Scheduled Task Timeline
          </h2>
          <p className="text-sm text-neutral-600">
            Deterministic lead-time scaling based on days remaining ({timeline.daysUntilEvent} days
            until event).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CalendarActionButtons timeline={timeline} brief={brief} />
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
            <span className="text-xs font-medium text-neutral-600">Risk:</span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${risk.bg}`}
            >
              {risk.label}
            </span>
          </div>
        </div>
      </header>

      <div className="space-y-2.5">
        {timeline.tasks.map((task) => (
          <TimelineTaskItem key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};
