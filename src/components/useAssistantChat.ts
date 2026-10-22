'use client';

import { useState, useRef, useEffect } from 'react';
import type { UserContext } from '@/core/context-engine';
import type { ChatMessage } from './ChatTranscript';

let globalMsgCounter = 0;
const generateId = (prefix: string) => `${prefix}_${++globalMsgCounter}`;

async function fetchAssistantResponse(
  context: UserContext,
  messages: ReadonlyArray<ChatMessage>,
  userMsg: ChatMessage,
): Promise<{ answer: string; rationale?: string }> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context,
      messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error ?? 'Unable to complete request. Safe fallback mode activated.');
  }

  const data = (await response.json()) as { answer?: string; rationale?: string };
  return { answer: data.answer ?? 'Response completed.', rationale: data.rationale };
}

export function useAssistantChat(context: UserContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isProcessing) inputRef.current?.focus();
  }, [isProcessing]);

  const handleSendMessage = async (promptText: string): Promise<void> => {
    const trimmed = promptText.trim();
    if (!trimmed || isProcessing) return;
    setErrorAlert(null);
    const userMsg: ChatMessage = { id: generateId('usr'), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setAnnouncement('Assistant is analyzing context and generating recommendations.');

    try {
      const data = await fetchAssistantResponse(context, messages, userMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId('ast'),
          role: 'assistant',
          content: data.answer,
          rationale: data.rationale,
        },
      ]);
      setAnnouncement(`Assistant responded: ${data.answer}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error occurred.';
      setErrorAlert(`${msg} Please select a quick-reply chip or retry.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isProcessing,
    announcement,
    errorAlert,
    inputRef,
    handleSendMessage,
  };
}
