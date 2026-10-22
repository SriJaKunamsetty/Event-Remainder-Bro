'use client';

import type { RefObject } from 'react';

interface ChatInputFormProps {
  readonly input: string;
  readonly setInput: (v: string) => void;
  readonly isProcessing: boolean;
  readonly onSend: (text: string) => void;
  readonly inputRef: RefObject<HTMLInputElement | null>;
}

export function ChatInputForm({
  input,
  setInput,
  isProcessing,
  onSend,
  inputRef,
}: ChatInputFormProps) {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSend(input);
        }}
        className="flex gap-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask the planning copilot a question
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isProcessing}
          aria-required="true"
          aria-describedby="input-helper-text"
          placeholder="e.g. Suggest catering options for 150 guests..."
          className="flex-1 min-h-[44px] rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-2 focus:outline-blue-700"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          aria-label="Send message to assistant"
          className="min-h-[44px] min-w-[80px] rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-2 focus:outline-blue-700 disabled:opacity-50"
        >
          {isProcessing ? 'Sending...' : 'Send'}
        </button>
      </form>
      <p id="input-helper-text" className="mt-1.5 text-xs text-neutral-500">
        Press Enter to submit. Sensitive personal identifiers are automatically redacted.
      </p>
    </div>
  );
}
