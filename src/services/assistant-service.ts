import type {
  ContextDecisionEngine,
  DecisionRoutingResult,
  UserContext,
} from '../core/context-engine';
import type { SecurityGuardrailEngine } from '../security/guardrails';

export interface GenerativeModelPort {
  generateStructuredResponse(params: {
    readonly systemPrompt: string;
    readonly userPrompt: string;
    readonly temperature: number;
    readonly signal?: AbortSignal;
  }): Promise<{ readonly text: string; readonly tokenUsage: number }>;
}

export interface AssistantResponse {
  readonly answer: string;
  readonly executionMode: 'autonomous' | 'human_in_the_loop' | 'deterministic_fallback';
  readonly requiresConfirmation: boolean;
  readonly rationale: string;
  readonly isFallback: boolean;
}

export class AssistantOrchestrationService {
  constructor(
    private readonly modelPort: GenerativeModelPort,
    private readonly contextEngine: ContextDecisionEngine,
    private readonly securityEngine: SecurityGuardrailEngine,
  ) {}

  public async processUserRequest(
    context: UserContext,
    rawUserPrompt: string,
    signal?: AbortSignal,
  ): Promise<AssistantResponse> {
    const inputAudit = this.securityEngine.inspectAndSanitizeInput(rawUserPrompt);
    if (!inputAudit.isSafe) {
      return {
        answer: `Request blocked by security policy: ${inputAudit.rejectionReason}`,
        executionMode: 'deterministic_fallback',
        requiresConfirmation: false,
        rationale: 'Input failed pre-execution deterministic guardrail inspection.',
        isFallback: true,
      };
    }

    const routing = this.contextEngine.evaluateContext(context, inputAudit.sanitizedText);
    if (routing.executionMode === 'deterministic_fallback') {
      return this.fallbackResponse(
        context,
        routing.rationale,
        routing.requiresExplicitConfirmation,
      );
    }

    return this.executeModelSession(context, routing, inputAudit.sanitizedText, signal);
  }

  private async executeModelSession(
    context: UserContext,
    routing: DecisionRoutingResult,
    sanitizedText: string,
    signal?: AbortSignal,
  ): Promise<AssistantResponse> {
    const canary = this.securityEngine.createCanaryProtectedSystemPrompt(
      routing.systemInstructionAugmentation,
    );

    try {
      const modelResult = await this.modelPort.generateStructuredResponse({
        systemPrompt: canary.protectedSystemPrompt,
        userPrompt: sanitizedText,
        temperature: routing.calibratedTemperature,
        signal,
      });

      const outputAudit = this.securityEngine.inspectAndSanitizeOutput(
        modelResult.text,
        canary.canaryToken,
      );

      if (!outputAudit.isSafe) {
        return this.fallbackResponse(
          context,
          'Output intercepted by post-generation security guardrail: canary leak detected.',
          true,
        );
      }

      return {
        answer: outputAudit.sanitizedOutput,
        executionMode: routing.executionMode,
        requiresConfirmation: routing.requiresExplicitConfirmation,
        rationale: routing.rationale,
        isFallback: false,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.fallbackResponse(context, `Upstream service fallback: ${message}`, false);
    }
  }

  private fallbackResponse(
    context: UserContext,
    rationale: string,
    requiresConfirmation: boolean,
  ): AssistantResponse {
    return {
      answer: `[Offline/Safe Mode - ${context.verticalPersona}] Automated AI synthesis paused to protect accuracy. Please refer to your computed budget and timeline checklist.`,
      executionMode: 'deterministic_fallback',
      requiresConfirmation,
      rationale,
      isFallback: true,
    };
  }
}
