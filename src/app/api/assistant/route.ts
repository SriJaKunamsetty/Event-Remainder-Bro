import { ContextDecisionEngine, UserContextSchema } from '@/core/context-engine';
import { SecurityGuardrailEngine } from '@/security/guardrails';
import { AssistantOrchestrationService } from '@/services/assistant-service';
import { GeminiRestAdapter } from '@/services/gemini-adapter';

interface ChatMessageInput {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

// Bounded sliding-window memory constant: prevents O(N) token bloat
const MAX_CONVERSATION_TURNS = 8;
export const MAX_AGENTIC_STEPS = 3; // Mitigates OWASP LLM10 runaway recursive tool calling

const contextEngine = new ContextDecisionEngine();
const securityEngine = new SecurityGuardrailEngine();
const geminiAdapter = new GeminiRestAdapter();
const assistantService = new AssistantOrchestrationService(
  geminiAdapter,
  contextEngine,
  securityEngine,
);

// In-memory sliding-window rate limiter (OWASP LLM10 Denial-of-Wallet mitigation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 45;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count += 1;
  return false;
}

/**
 * Prunes conversation history in O(1) slice time to bound memory and token consumption
 * while preserving the initial user goal and the most recent turns.
 */
function pruneConversationHistory(
  messages: ReadonlyArray<ChatMessageInput>,
): ReadonlyArray<ChatMessageInput> {
  if (messages.length <= MAX_CONVERSATION_TURNS) {
    return messages;
  }
  const first = messages[0];
  const recents = messages.slice(-MAX_CONVERSATION_TURNS + 1);
  return first ? [first, ...recents] : recents;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const clientKey = req.headers.get('x-forwarded-for') ?? 'local_user';
    if (isRateLimited(clientKey)) {
      return Response.json(
        { error: 'Rate limit exceeded. Please wait before retrying.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = (await req.json()) as {
      context?: unknown;
      messages?: ReadonlyArray<ChatMessageInput>;
    };

    const parsedContext = UserContextSchema.safeParse(body.context);
    if (!parsedContext.success) {
      return Response.json(
        { error: 'Invalid user context schema', details: parsedContext.error.flatten() },
        { status: 400 },
      );
    }

    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const boundedMessages = pruneConversationHistory(rawMessages);
    const latestMessage = boundedMessages[boundedMessages.length - 1];
    const rawUserText = typeof latestMessage?.content === 'string' ? latestMessage.content : '';

    // 1. Deterministic pre-inference security inspection
    const inputAudit = securityEngine.inspectAndSanitizeInput(rawUserText);
    if (!inputAudit.isSafe) {
      return Response.json({ error: inputAudit.rejectionReason }, { status: 422 });
    }

    const assistantResult = await assistantService.processUserRequest(
      parsedContext.data,
      inputAudit.sanitizedText,
      req.signal,
    );

    return Response.json(assistantResult, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: 'Assistant processing failed gracefully',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallbackAvailable: true,
      },
      { status: 503 },
    );
  }
}
