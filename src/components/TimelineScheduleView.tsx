'use client';

import type { Timeline, TimelineTask } from '@/domain/timeline';

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

export const TimelineScheduleView = ({ timeline }: { readonly timeline: Timeline }) => {
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
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
        <div>
          <h2 id="timeline-heading" className="text-xl font-bold text-neutral-900">
            Backward-Scheduled Task Timeline
          </h2>
          <p className="text-sm text-neutral-600">
            Deterministic lead-time scaling based on days remaining ({timeline.daysUntilEvent} days
            until event).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-600">Schedule Risk:</span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${risk.bg}`}
          >
            {risk.label}
          </span>
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
