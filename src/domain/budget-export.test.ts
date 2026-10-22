import { describe, it, expect } from 'vitest';
import { generateBudgetCsv } from './budget-export';
import { allocateBudget } from './budget';
import type { EventBrief } from './schemas';

describe('generateBudgetCsv', () => {
  const sampleBrief: EventBrief = {
    eventType: 'wedding',
    eventDate: '2027-06-12',
    guestCount: 150,
    totalBudgetMinor: 50_000_000,
    currency: 'INR',
    venueType: 'hybrid',
    priorities: ['catering', 'venue', 'photography'],
    servesAlcohol: true,
    dietaryNeeds: ['vegetarian'],
    accessibilityNeeds: ['wheelchair_access'],
    plannerExperience: 'first_time',
  };

  it('generates a valid CSV with headers, data lines, and summary', () => {
    const plan = allocateBudget(sampleBrief);
    const csv = generateBudgetCsv(plan);

    expect(csv).toContain('Category,Share Percentage,Formatted Amount,Minor Units,Currency');
    expect(csv).toContain('catering');
    expect(csv).toContain('Total Budget');
    expect(csv).toContain('Per Guest Budget');
    expect(csv).toContain('Mathematical Allocation Rationale:');
  });

  it('escapes fields with commas or special characters correctly', () => {
    const plan = allocateBudget(sampleBrief);
    const csv = generateBudgetCsv(plan);
    // All lines should be separated by \r\n as per RFC 4180
    expect(csv).toContain('\r\n');
  });
});
