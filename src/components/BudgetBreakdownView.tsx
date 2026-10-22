'use client';

import type { BudgetLine, BudgetPlan } from '@/domain/budget';
import { generateBudgetCsv } from '@/domain/budget-export';
import { formatMinor } from '@/domain/money';

function downloadBudgetCsv(plan: BudgetPlan): void {
  const csvContent = generateBudgetCsv(plan);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `EventCraft_Budget_${plan.currency}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function BudgetCard({ line, currency }: { readonly line: BudgetLine; readonly currency: string }) {
  const isContingency = line.category === 'contingency';
  return (
    <div
      className={`rounded-lg border p-3 ${
        isContingency ? 'border-amber-300 bg-amber-50/50' : 'border-neutral-200 bg-neutral-50/60'
      }`}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold capitalize text-neutral-900">{line.category}</span>
        <span className="text-xs font-bold text-neutral-600">{line.sharePercent}%</span>
      </div>
      <div className="mt-1 text-base font-bold text-neutral-900">
        {formatMinor(line.amountMinor, currency)}
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full ${isContingency ? 'bg-amber-600' : 'bg-blue-600'}`}
          style={{ width: `${Math.min(100, line.sharePercent)}%` }}
        />
      </div>
    </div>
  );
}

function BudgetHeaderSummary({ plan }: { readonly plan: BudgetPlan }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-right">
        <span className="text-xs text-neutral-500 uppercase tracking-wider block">
          Total Budget
        </span>
        <span className="text-lg font-bold text-neutral-900">
          {formatMinor(plan.totalMinor, plan.currency)}
        </span>
      </div>
      <div className="text-right border-l border-neutral-200 pl-3">
        <span className="text-xs text-neutral-500 uppercase tracking-wider block">Per Guest</span>
        <span className="text-lg font-bold text-blue-700">
          {formatMinor(plan.perGuestMinor, plan.currency)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => downloadBudgetCsv(plan)}
        aria-label="Download Penny-Perfect Budget Allocation CSV spreadsheet"
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50 focus:outline-2 focus:outline-blue-700 min-h-[44px]"
      >
        <span>📥</span>
        <span>Export CSV</span>
      </button>
    </div>
  );
}

export const BudgetBreakdownView = ({ plan }: { readonly plan: BudgetPlan }) => {
  return (
    <section
      aria-labelledby="budget-heading"
      className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h2 id="budget-heading" className="text-xl font-bold text-neutral-900">
            Penny-Perfect Budget Allocation
          </h2>
          <p className="text-sm text-neutral-600">
            Calculated via Largest-Remainder (Hare-Niemeyer) in integer minor units. Zero rounding
            drift.
          </p>
        </div>
        <BudgetHeaderSummary plan={plan} />
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plan.lines.map((line) => (
          <BudgetCard key={line.category} line={line} currency={plan.currency} />
        ))}
      </div>

      <div className="mt-5 rounded-lg bg-neutral-50 p-4 border border-neutral-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
          Mathematical Allocation Rationale
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-700">
          {plan.rationale.map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
