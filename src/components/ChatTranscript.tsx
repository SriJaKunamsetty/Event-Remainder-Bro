'use client';

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly rationale?: string;
}

function ChatArticle({ msg }: { readonly msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <article
      className={`mb-3 rounded-lg p-3 ${
        isUser
          ? 'ml-8 bg-blue-50 text-neutral-900 border border-blue-200'
          : 'mr-8 bg-white text-neutral-900 border border-neutral-200 shadow-xs'
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
        {isUser ? 'You' : 'Assistant Copilot'}
      </div>
      <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
      {msg.rationale && (
        <details className="mt-2 text-xs text-neutral-600">
          <summary className="cursor-pointer font-medium underline focus:outline-2 focus:outline-blue-700">
            Decision Logic & Context Audit
          </summary>
          <p className="mt-1 bg-neutral-100 p-2 rounded">{msg.rationale}</p>
        </details>
      )}
    </article>
  );
}

export function ChatTranscript({
  messages,
  isProcessing,
}: {
  readonly messages: ReadonlyArray<ChatMessage>;
  readonly isProcessing: boolean;
}) {
  return (
    <div
      role="log"
      aria-label="Conversation transcript"
      aria-live={isProcessing ? 'off' : 'polite'}
      aria-busy={isProcessing}
      tabIndex={0}
      className="mb-4 h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 focus:outline-2 focus:outline-blue-700"
    >
      {messages.length === 0 ? (
        <p className="text-sm text-neutral-500 italic">
          No questions yet. Ask any planning question or choose one of the quick suggestions below.
        </p>
      ) : (
        messages.map((msg) => <ChatArticle key={msg.id} msg={msg} />)
      )}
    </div>
  );
}
