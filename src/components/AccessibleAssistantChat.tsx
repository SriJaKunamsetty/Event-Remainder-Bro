'use client';

import type { UserContext } from '@/core/context-engine';
import { ChatTranscript } from './ChatTranscript';
import { ChatInputForm } from './ChatInputForm';
import { useAssistantChat } from './useAssistantChat';

const QUICK_PROMPTS: ReadonlyArray<string> = [
  'Suggest unique celebration themes',
  'How can I optimize catering budget?',
  'What vendor questions should I ask first?',
  'Suggest weather contingency plans',
];

function ChatNavChips({
  isProcessing,
  onSelect,
}: {
  readonly isProcessing: boolean;
  readonly onSelect: (p: string) => void;
}) {
  return (
    <nav aria-label="Quick planning prompts" className="mb-4 flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((p) => (
        <button
          key={p}
          type="button"
          disabled={isProcessing}
          onClick={() => onSelect(p)}
          className="min-h-[44px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-100 focus:outline-2 focus:outline-blue-700 disabled:opacity-50"
        >
          {p}
        </button>
      ))}
    </nav>
  );
}

export const AccessibleAssistantChat = ({ context }: { readonly context: UserContext }) => {
  const {
    messages,
    input,
    setInput,
    isProcessing,
    announcement,
    errorAlert,
    inputRef,
    handleSendMessage,
  } = useAssistantChat(context);

  return (
    <section
      aria-labelledby="assistant-heading"
      className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 border-b border-neutral-200 pb-3">
        <h2 id="assistant-heading" className="text-xl font-bold text-neutral-900">
          GenAI Planning Copilot (Google PAIR Calibrated)
        </h2>
        <p className="text-sm text-neutral-600">
          Context-aware guidance adapted to your event profile.
        </p>
      </header>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {errorAlert && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 rounded-lg border border-red-700 bg-red-50 p-3 text-sm text-red-900"
        >
          <strong>Notice: </strong>
          {errorAlert}
        </div>
      )}

      <ChatTranscript messages={messages} isProcessing={isProcessing} />
      <ChatNavChips isProcessing={isProcessing} onSelect={handleSendMessage} />
      <ChatInputForm
        input={input}
        setInput={setInput}
        isProcessing={isProcessing}
        onSend={handleSendMessage}
        inputRef={inputRef}
      />
    </section>
  );
};
