'use client';

import { PRIORITY_CATEGORIES, type PriorityCategory } from '@/domain/schemas';

interface PrioritiesSelectorProps {
  readonly priorities: ReadonlyArray<PriorityCategory>;
  readonly onToggle: (cat: PriorityCategory) => void;
}

export const PrioritiesSelector = ({ priorities, onToggle }: PrioritiesSelectorProps) => {
  return (
    <fieldset className="border border-neutral-200 rounded-lg p-3">
      <legend className="text-xs font-bold uppercase tracking-wider text-neutral-700 px-1">
        Priority Weighting (Select up to 3 in priority order)
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {PRIORITY_CATEGORIES.map((cat) => {
          const idx = priorities.indexOf(cat);
          const isSelected = idx !== -1;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onToggle(cat)}
              className={`min-h-[44px] rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all focus:outline-2 focus:outline-blue-700 ${
                isSelected
                  ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {isSelected ? `#${idx + 1} ` : ''}
              {cat}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
