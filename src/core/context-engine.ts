import { z } from 'zod';

export const UserContextSchema = z.strictObject({
  userId: z.string().min(1),
  verticalPersona: z.enum([
    'celebration_planner',
    'wedding_concierge',
    'birthday_specialist',
    'community_coordinator',
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
    const isCriticalUrgency = context.urgencyLevel === 'critical';
    const containsHighStakeIntent =
      /\b(cancel|deposit|contract|sign|payment|liability|alcohol\s+licence|permit)\b/i.test(
        userQuery,
      );

    if (isCriticalUrgency && containsHighStakeIntent) {
      return {
        executionMode: 'deterministic_fallback',
        calibratedTemperature: 0.0,
        systemInstructionAugmentation:
          'CRITICAL TIMELINE STATE: Provide strictly verified emergency checklists. Do not speculate.',
        requiresExplicitConfirmation: true,
        rationale:
          'High-stakes event action combined with critical urgency triggers deterministic protocol.',
      };
    }

    if (containsHighStakeIntent) {
      return {
        executionMode: 'human_in_the_loop',
        calibratedTemperature: 0.2,
        systemInstructionAugmentation: this.buildPersonaDirectives(context),
        requiresExplicitConfirmation: true,
        rationale:
          'Action impacts contracts, alcohol licensing, or non-refundable deposits; explicit human confirmation required.',
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
