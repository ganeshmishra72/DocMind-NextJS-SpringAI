"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Send,
  Sparkles,
  Download,
  RotateCcw,
  Zap,
  ToggleLeft,
  ToggleRight,
  StopCircle,
} from "lucide-react";
import { TemplateGrid } from "./TemplateGrid";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage, ChatScope } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatPanel({
  scopeLabel,
  messages,
  isThinking,
  onSend,
  onStop,
  onClear,
  streaming,
  onToggleStreaming,
}: {
  scopeLabel: string;
  messages: ChatMessage[];
  isThinking: boolean;
  onSend: (text: string, streaming: boolean) => void;
  onStop: () => void;
  onClear: () => void;
  streaming: boolean;
  onToggleStreaming: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!input.trim() || isThinking) return;
    onSend(input, streaming);
    setInput("");
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const exportChat = () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "DocMind"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docmind-chat.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-base-950 bg-grid">
      {/* Sub-header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-base-700 px-5 text-xs">
        <div className="flex items-center gap-2 text-base-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Context: <span className="font-medium text-base-200">{scopeLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleStreaming}
            className="flex items-center gap-1.5 text-base-400 hover:text-base-200 transition-colors"
          >
            {streaming ? (
              <ToggleRight className="h-4 w-4 text-accent-400" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            Stream Tokens
          </button>
          <button
            onClick={exportChat}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 text-base-400 hover:text-base-200 transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={onClear}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 text-base-400 hover:text-base-200 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-600 text-white glow-ring"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold text-base-100">DocMind AI Document Assistant</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-base-400">
                Upload PDF reports, Word files, or notes and chat naturally with
                grounded facts, source citations, and page numbers.
              </p>
            </div>
            <TemplateGrid
  onSelect={(prompt) => {
    if (!prompt.trim() || isThinking) return;
    onSend(prompt, streaming);
  }}
/>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-base-700 px-5 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-base-700 bg-base-850 px-3 py-2 focus-within:border-accent-500/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask a question across all documents..."
            className="max-h-40 w-full resize-none bg-transparent py-1.5 text-sm text-base-100 placeholder:text-base-500 outline-none"
          />
          {isThinking ? (
            <button
              onClick={onStop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-700 text-base-200 hover:bg-base-600 transition-colors"
            >
              <StopCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!input.trim()}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                input.trim()
                  ? "bg-accent-600 text-white hover:bg-accent-500"
                  : "bg-base-750 text-base-500"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between text-[11px] text-base-500">
          <span>
            Press <kbd className="rounded border border-base-700 bg-base-800 px-1">Enter</kbd> to send,{" "}
            <kbd className="rounded border border-base-700 bg-base-800 px-1">Shift+Enter</kbd> for newline
          </span>
          <span className="flex items-center gap-1 text-accent-400">
            <Zap className="h-3 w-3" /> Grounded RAG
          </span>
        </div>
      </div>
    </section>
  );
}
