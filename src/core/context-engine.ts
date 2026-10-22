import { z } from 'zod';

export const UserContextSchema = z.strictObject({
  userId: z.string().min(1),
  verticalPersona: z.enum([
    'celebration_planner',
    'wedding_concierge',
    'birthday_specialist',
    'community_coordinator',
    'financial_advisor',
    'healthcare_triage',
    'education_tutor',
    'ops_copilot',
  ]),
  expertiseLevel: z.enum(['novice', 'intermediate', 'expert']),
  urgencyLevel: z.enum(['low', 'normal', 'critical']),
  activeConstraints: z.array(z.string()).max(10).default([]),
  feedbackHistoryScore: z.number().min(-1).max(1).default(0),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export interface DecisionRoutingResult {
  readonly executionMode: 'autonomous' | 'human_in_the_loop' | 'deterministic_fallback';
  readonly calibratedTemperature: number;
  readonly systemInstructionAugmentation: string;
  readonly requiresExplicitConfirmation: boolean;
  readonly rationale: string;
}

/**
 * Evaluates user context deterministically BEFORE invoking the generative model.
 * Enforces Google People + AI Research (PAIR) guidelines:
 * - Data & Model Alignment: Maps domain context to model behaviour.
 * - User Autonomy: Escalates high-risk or destructive actions to Human-in-the-Loop.
 * - Trust Calibration: Adapts response density and tone to user expertise.
 */
export class ContextDecisionEngine {
  public evaluateContext(context: UserContext, userQuery: string): DecisionRoutingResult {
    const isHighRiskDomain =
      context.verticalPersona === 'healthcare_triage' ||
      context.verticalPersona === 'financial_advisor';
    const isCriticalUrgency = context.urgencyLevel === 'critical';
    const containsDestructiveIntent =
      /\b(cancel|deposit|contract|sign|payment|liability|alcohol\s+licence|permit|delete|transfer|execute|override|prescribe)\b/i.test(
        userQuery,
      );

    if (isCriticalUrgency && (isHighRiskDomain || containsDestructiveIntent)) {
      return {
        executionMode: 'deterministic_fallback',
        calibratedTemperature: 0.0,
        systemInstructionAugmentation:
          'CRITICAL STATE: Provide strictly verified emergency checklists and protocol steps. Do not speculate.',
        requiresExplicitConfirmation: true,
        rationale:
          'High-stakes action combined with critical urgency triggers deterministic safety protocol.',
      };
    }

    if (containsDestructiveIntent || isHighRiskDomain) {
      return {
        executionMode: 'human_in_the_loop',
        calibratedTemperature: 0.2,
        systemInstructionAugmentation: this.buildPersonaDirectives(context),
        requiresExplicitConfirmation: true,
        rationale:
          'Action impacts sensitive state or regulated vertical; human confirmation required prior to execution.',
      };
    }

    const temperature =
      context.expertiseLevel === 'novice'
        ? 0.3
        : context.expertiseLevel === 'intermediate'
          ? 0.4
          : 0.5;

    return {
      executionMode: 'autonomous',
      calibratedTemperature: temperature,
      systemInstructionAugmentation: this.buildPersonaDirectives(context),
      requiresExplicitConfirmation: false,
      rationale:
        'Standard event planning query within safe parameters; autonomous copilot mode active.',
    };
  }

  private buildPersonaDirectives(context: UserContext): string {
    const expertiseDirectives: Record<UserContext['expertiseLevel'], string> = {
      novice:
        'Explain event concepts using step-by-step progressive disclosure, simple guidance, and avoid vendor jargon.',
      intermediate:
        'Provide structured actionable recommendations with vendor options, timeline impacts, and budget trade-offs.',
      expert:
        'Deliver high-density operational plans, contract contingencies, vendor SLA details, and exact lead-time calculations.',
    };

    const feedbackDirective =
      context.feedbackHistoryScore < -0.3
        ? 'NOTE: Prior recommendations did not match user expectations. Present 2 distinct alternatives and confirm preferences.'
        : 'Maintain standard collaborative planning cadence.';

    return [
      `Active Vertical: ${context.verticalPersona}.`,
      `Communication Style: ${expertiseDirectives[context.expertiseLevel]}`,
      `Active Constraints: ${context.activeConstraints.join(', ') || 'None'}.`,
      `Co-Learning Directive: ${feedbackDirective}`,
    ].join(' ');
  }
}
