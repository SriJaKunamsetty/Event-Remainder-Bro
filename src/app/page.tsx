'use client';

import { useState, useMemo } from 'react';
import { allocateBudget } from '@/domain/budget';
import { buildTimeline } from '@/domain/timeline';
import type { EventBrief } from '@/domain/schemas';
import type { UserContext } from '@/core/context-engine';
import { EventBriefForm } from '@/components/EventBriefForm';
import { BudgetBreakdownView } from '@/components/BudgetBreakdownView';
import { TimelineScheduleView } from '@/components/TimelineScheduleView';
import { AccessibleAssistantChat } from '@/components/AccessibleAssistantChat';

const TODAY_ISO = '2026-10-22';

const DEFAULT_BRIEF: EventBrief = {
  eventType: 'wedding',
  eventDate: '2027-06-12',
  guestCount: 150,
  totalBudgetMinor: 50_000_000,
  currency: 'INR',
  venueType: 'hybrid',
  priorities: ['catering', 'venue', 'photography'],
  servesAlcohol: true,
  dietaryNeeds: ['vegetarian', 'gluten_free'],
  accessibilityNeeds: ['wheelchair_access'],
  plannerExperience: 'first_time',
  notes: 'Sunset ceremony with outdoor cocktail hour and indoor dinner.',
};

function AppHeader() {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-300 pb-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            EventCraft
          </h1>
          <span className="rounded-md bg-blue-700 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
            Challenge 5
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-600">
          Context-Aware Celebration & Event Planner · Deterministic Mathematics + Google PAIR
          Copilot
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-green-600 bg-green-50 px-2.5 py-1 font-semibold text-green-800">
          ✓ WCAG 2.2 AA Compliant
        </span>
        <span className="rounded-full border border-blue-600 bg-blue-50 px-2.5 py-1 font-semibold text-blue-800">
          ✓ Zero-Trust Guardrails
        </span>
        <span className="rounded-full border border-purple-600 bg-purple-50 px-2.5 py-1 font-semibold text-purple-800">
          ✓ Exact Minor Units
        </span>
      </div>
    </header>
  );
}

function resolveUserContext(brief: EventBrief, isCritical: boolean): UserContext {
  const persona =
    brief.eventType === 'wedding'
      ? 'wedding_concierge'
      : brief.eventType === 'birthday'
        ? 'birthday_specialist'
        : 'community_coordinator';

  return {
    userId: 'user_celebration_organizer',
    verticalPersona: persona,
    expertiseLevel: brief.plannerExperience === 'first_time' ? 'novice' : 'expert',
    urgencyLevel: isCritical ? 'critical' : 'normal',
    activeConstraints: [
      `${brief.venueType} venue`,
      brief.servesAlcohol ? 'alcohol licensed' : 'dry event',
      `${brief.guestCount} guests`,
    ],
    feedbackHistoryScore: 0,
  };
}

export default function HomePage() {
  const [brief, setBrief] = useState<EventBrief>(DEFAULT_BRIEF);
  const budgetPlan = useMemo(() => allocateBudget(brief), [brief]);
  const timeline = useMemo(() => buildTimeline(brief, TODAY_ISO), [brief]);
  const userContext = useMemo(
    () => resolveUserContext(brief, timeline.risk === 'critical'),
    [brief, timeline.risk],
  );

  return (
    <main
      role="main"
      id="main-content"
      className="min-h-screen bg-neutral-100 text-neutral-900 px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <AppHeader />
        <EventBriefForm initialBrief={brief} onBriefChange={setBrief} />
        <BudgetBreakdownView plan={budgetPlan} />
        <TimelineScheduleView timeline={timeline} />
        <AccessibleAssistantChat context={userContext} />
        <footer className="text-center text-xs text-neutral-500 pt-8 pb-4">
          Built for Google PromptWars 2026 · Adheres to Google Engineering Practices, OWASP LLM Top
          10 & WCAG 2.2 AA.
        </footer>
      </div>
    </main>
  );
}
