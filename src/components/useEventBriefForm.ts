'use client';

import { useState } from 'react';
import type { EventBrief, PriorityCategory } from '@/domain/schemas';
import { toMinorUnits } from '@/domain/money';

export function useEventBriefForm(
  initialBrief: EventBrief,
  onBriefChange: (brief: EventBrief) => void,
) {
  const [brief, setBrief] = useState<EventBrief>(initialBrief);
  const [majorBudget, setMajorBudget] = useState<number>(500000);

  const handleTogglePriority = (cat: PriorityCategory) => {
    setBrief((prev) => {
      const p = prev.priorities;
      const next = p.includes(cat) ? p.filter((c) => c !== cat) : p.length < 3 ? [...p, cat] : p;
      return { ...prev, priorities: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBriefChange({
      ...brief,
      totalBudgetMinor: toMinorUnits(majorBudget, brief.currency),
    });
  };

  return {
    brief,
    setBrief,
    majorBudget,
    setMajorBudget,
    handleTogglePriority,
    handleSubmit,
  };
}
