"use client";

import { useCallback, useRef, useState } from "react";
import { docmindApi } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useChat(scope?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string, streaming: boolean) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      const assistantId = uid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsThinking(true);

      const updateAssistant = (patch: Partial<ChatMessage>) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m))
        );
      };

      try {
        if (streaming) {
          const controller = new AbortController();
          abortRef.current = controller;
          let acc = "";
          await docmindApi.chatStream(
            trimmed,
            scope,
            (token) => {
              acc += token;
              updateAssistant({ content: acc });
            },
            controller.signal
          );
          updateAssistant({ isStreaming: false });
        } else {
          const res = await docmindApi.chat(trimmed, scope);
          updateAssistant({
            content: res.content,
            citations: res.citations,
            isStreaming: false,
          });
        }
      } catch (err) {
        updateAssistant({
          content:
            err instanceof Error
              ? `Couldn't reach DocMind: ${err.message}`
              : "Something went wrong reaching the backend.",
          isStreaming: false,
          error: true,
        });
      } finally {
        setIsThinking(false);
        abortRef.current = null;
      }
    },
    [scope]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, isThinking, send, stop, clear };
}
