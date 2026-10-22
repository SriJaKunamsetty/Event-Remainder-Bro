import { ContextDecisionEngine, UserContextSchema } from '@/core/context-engine';
import { SecurityGuardrailEngine } from '@/security/guardrails';
import { AssistantOrchestrationService } from '@/services/assistant-service';
import { GeminiRestAdapter } from '@/services/gemini-adapter';

interface ChatMessageInput {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

const MAX_CONVERSATION_TURNS = 8;

const contextEngine = new ContextDecisionEngine();
const securityEngine = new SecurityGuardrailEngine();
const geminiAdapter = new GeminiRestAdapter();
const assistantService = new AssistantOrchestrationService(
  geminiAdapter,
  contextEngine,
  securityEngine,
);

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

    const assistantResult = await assistantService.processUserRequest(
      parsedContext.data,
      rawUserText,
      req.signal,
    );

    return Response.json(assistantResult, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        error: 'Assistant processing degraded gracefully.',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallbackAvailable: true,
      },
      { status: 200 },
    );
  }
}
