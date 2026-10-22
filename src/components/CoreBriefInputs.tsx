'use client';

import { EVENT_TYPES, VENUE_TYPES, type EventType, type VenueType } from '@/domain/schemas';

interface EventDetailsProps {
  readonly eventType: EventType;
  readonly onType: (t: EventType) => void;
  readonly eventDate: string;
  readonly onDate: (d: string) => void;
  readonly guests: number;
  readonly onGuests: (g: number) => void;
}

function EventDetailsInputs(p: EventDetailsProps) {
  return (
    <>
      <div>
        <label
          htmlFor="brief-event-type"
          className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          Event Type
        </label>
        <select
          id="brief-event-type"
          value={p.eventType}
          onChange={(e) => p.onType(e.target.value as EventType)}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="brief-date"
          className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          Event Date
        </label>
        <input
          id="brief-date"
          type="date"
          value={p.eventDate}
          onChange={(e) => p.onDate(e.target.value)}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        />
      </div>
      <div>
        <label
          htmlFor="brief-guests"
          className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          Guests
        </label>
        <input
          id="brief-guests"
          type="number"
          min={1}
          max={5000}
          value={p.guests}
          onChange={(e) => p.onGuests(Number(e.target.value))}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        />
      </div>
    </>
  );
}

interface FinancialProps {
  readonly budget: number;
  readonly onBudget: (b: number) => void;
  readonly currency: string;
  readonly onCurrency: (c: string) => void;
}

function EventFinancialInputs(p: FinancialProps) {
  return (
    <>
      <div>
        <label
          htmlFor="brief-budget"
          className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          Budget
        </label>
        <input
          id="brief-budget"
          type="number"
          min={100}
          value={p.budget}
          onChange={(e) => p.onBudget(Number(e.target.value))}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        />
      </div>
      <div>
        <label
          htmlFor="brief-currency"
          className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
        >
          Currency
        </label>
        <select
          id="brief-currency"
          value={p.currency}
          onChange={(e) => p.onCurrency(e.target.value)}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
    </>
  );
}

function VenueInput({
  venue,
  onVenue,
}: {
  readonly venue: VenueType;
  readonly onVenue: (v: VenueType) => void;
}) {
  return (
    <div>
      <label
        htmlFor="brief-venue"
        className="block text-xs font-bold uppercase tracking-wider text-neutral-700"
      >
        Venue
      </label>
      <select
        id="brief-venue"
        value={venue}
        onChange={(e) => onVenue(e.target.value as VenueType)}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
      >
        {VENUE_TYPES.map((v) => (
          <option key={v} value={v}>
            {v.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

export interface CoreBriefInputsProps extends EventDetailsProps, FinancialProps {
  readonly venue: VenueType;
  readonly onVenue: (v: VenueType) => void;
}

export const CoreBriefInputs = (p: CoreBriefInputsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <EventDetailsInputs
        eventType={p.eventType}
        onType={p.onType}
        eventDate={p.eventDate}
        onDate={p.onDate}
        guests={p.guests}
        onGuests={p.onGuests}
      />
      <EventFinancialInputs
        budget={p.budget}
        onBudget={p.onBudget}
        currency={p.currency}
        onCurrency={p.onCurrency}
      />
      <VenueInput venue={p.venue} onVenue={p.onVenue} />
    </div>
  );
};
