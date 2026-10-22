import type { BudgetPlan } from './budget';
import { formatMinor } from './money';

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Serializes a Penny-Perfect BudgetPlan into RFC 4180 CSV text.
 * Suitable for Excel, Google Sheets, and procurement audits.
 */
export function generateBudgetCsv(plan: BudgetPlan): string {
  const headers = ['Category', 'Share Percentage', 'Formatted Amount', 'Minor Units', 'Currency'];
  const dataRows = plan.lines.map((line) => [
    line.category,
    `${line.sharePercent}%`,
    formatMinor(line.amountMinor, plan.currency),
    String(line.amountMinor),
    plan.currency,
  ]);

  const summaryRows = [
    [
      'Total Budget',
      '100%',
      formatMinor(plan.totalMinor, plan.currency),
      String(plan.totalMinor),
      plan.currency,
    ],
    [
      'Per Guest Budget',
      '',
      formatMinor(plan.perGuestMinor, plan.currency),
      String(plan.perGuestMinor),
      plan.currency,
    ],
  ];

  const allRows = [headers, ...dataRows, [], ...summaryRows];

  if (plan.rationale.length > 0) {
    allRows.push([], ['Mathematical Allocation Rationale:']);
    for (const reason of plan.rationale) {
      allRows.push([reason]);
    }
  }

  return allRows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}
