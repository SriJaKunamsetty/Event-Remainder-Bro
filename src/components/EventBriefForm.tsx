'use client';

import type { EventBrief } from '@/domain/schemas';
import { CoreBriefInputs } from './CoreBriefInputs';
import { PrioritiesSelector } from './PrioritiesSelector';
import { ContextToggles } from './ContextToggles';
import { useEventBriefForm } from './useEventBriefForm';

export const EventBriefForm = ({
  initialBrief,
  onBriefChange,
}: {
  readonly initialBrief: EventBrief;
  readonly onBriefChange: (brief: EventBrief) => void;
}) => {
  const { brief, setBrief, majorBudget, setMajorBudget, handleTogglePriority, handleSubmit } =
    useEventBriefForm(initialBrief, onBriefChange);

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Event Configuration Form"
      className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm space-y-4"
    >
      <header className="border-b border-neutral-200 pb-3">
        <h2 className="text-xl font-bold text-neutral-900">Event Specification Brief</h2>
        <p className="text-sm text-neutral-600">
          Modify context to recalculate penny-perfect budget and scheduled lead times.
        </p>
      </header>

      <CoreBriefInputs
        eventType={brief.eventType}
        onType={(t) => setBrief((b) => ({ ...b, eventType: t }))}
        eventDate={brief.eventDate}
        onDate={(d) => setBrief((b) => ({ ...b, eventDate: d }))}
        guests={brief.guestCount}
        onGuests={(g) => setBrief((b) => ({ ...b, guestCount: g }))}
        budget={majorBudget}
        onBudget={setMajorBudget}
        currency={brief.currency}
        onCurrency={(c) => setBrief((b) => ({ ...b, currency: c }))}
        venue={brief.venueType}
        onVenue={(v) => setBrief((b) => ({ ...b, venueType: v }))}
      />
      <PrioritiesSelector priorities={brief.priorities} onToggle={handleTogglePriority} />
      <ContextToggles
        alcohol={brief.servesAlcohol}
        onAlcohol={(a) => setBrief((b) => ({ ...b, servesAlcohol: a }))}
        dietary={brief.dietaryNeeds.length > 0}
        onDietary={(d) =>
          setBrief((b) => ({ ...b, dietaryNeeds: d ? ['vegetarian', 'gluten_free'] : [] }))
        }
        accessibility={brief.accessibilityNeeds.length > 0}
        onAccessibility={(ac) =>
          setBrief((b) => ({ ...b, accessibilityNeeds: ac ? ['wheelchair_access'] : [] }))
        }
      />
      <button
        type="submit"
        className="w-full sm:w-auto min-h-[44px] rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-800 focus:outline-2 focus:outline-blue-700"
      >
        Recalculate Plan & Synchronize Copilot
      </button>
    </form>
  );
};
