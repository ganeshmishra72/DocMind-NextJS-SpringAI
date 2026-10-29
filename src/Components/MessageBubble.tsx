"use client";

import { motion } from "motion/react";
import {
  User,
  Sparkles,
  Copy,
  Check,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export function MessageBubble({
  message,
}: {
  message: ChatMessage;
}) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(message.content);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-accent-600 text-white"
            : "bg-accent-500/15 text-accent-400"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1.5",
          isUser && "items-end"
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm border-accent-500 bg-accent-600 text-white"
              : message.error
              ? "rounded-tl-sm border-red-500/30 bg-red-500/5 text-red-300"
              : "rounded-tl-sm border-base-700 bg-base-850 text-base-100"
          )}
        >
          {/* Error */}
          {message.error && (
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Connection issue
            </div>
          )}

          {/* User Message */}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.content ? (
            /* Assistant Markdown */
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  /* Paragraph */
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">
                      {children}
                    </p>
                  ),

                  /* Headings */
                  h1: ({ children }) => (
                    <h1 className="mb-3 text-lg font-semibold text-base-50">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="mb-2.5 text-base font-semibold text-base-50">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="mb-2 text-sm font-semibold text-base-50">
                      {children}
                    </h3>
                  ),

                  /* Unordered List */
                  ul: ({ children }) => (
                    <ul className="mb-3 ml-5 list-disc space-y-1.5">
                      {children}
                    </ul>
                  ),

                  /* Ordered List */
                  ol: ({ children }) => (
                    <ol className="mb-3 ml-5 list-decimal space-y-1.5">
                      {children}
                    </ol>
                  ),

                  /* List Item */
                  li: ({ children }) => (
                    <li className="pl-1 leading-relaxed">
                      {children}
                    </li>
                  ),

                  /* Bold */
                  strong: ({ children }) => (
                    <strong className="font-semibold text-base-50">
                      {children}
                    </strong>
                  ),

                  /* Italic */
                  em: ({ children }) => (
                    <em className="italic text-base-200">
                      {children}
                    </em>
                  ),

                  /* Inline Code */
                  code: ({ children }) => (
                    <code className="rounded-md border border-base-700 bg-base-800 px-1.5 py-0.5 font-mono text-xs text-accent-300">
                      {children}
                    </code>
                  ),

                  /* Code Block */
                  pre: ({ children }) => (
                    <pre className="my-3 overflow-x-auto rounded-lg border border-base-700 bg-base-900 p-3 font-mono text-xs leading-relaxed">
                      {children}
                    </pre>
                  ),

                  /* Blockquote */
                  blockquote: ({ children }) => (
                    <blockquote className="my-3 border-l-2 border-accent-500/50 pl-3 text-base-300">
                      {children}
                    </blockquote>
                  ),

                  /* Horizontal Rule */
                  hr: () => (
                    <hr className="my-3 border-base-700" />
                  ),

                  /* Links */
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-400 underline decoration-accent-500/30 underline-offset-2 hover:text-accent-300"
                    >
                      {children}
                    </a>
                  ),

                  /* Table */
                  table: ({ children }) => (
                    <div className="my-3 overflow-x-auto rounded-lg border border-base-700">
                      <table className="w-full border-collapse text-xs">
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-base-800">
                      {children}
                    </thead>
                  ),

                  th: ({ children }) => (
                    <th className="border-b border-base-700 px-3 py-2 text-left font-semibold text-base-100">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border-b border-base-800 px-3 py-2 text-base-300">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : message.isStreaming ? (
            /* Thinking Indicator */
            <span className="flex items-center gap-1">
              <Dot delay={0} />
              <Dot delay={0.15} />
              <Dot delay={0.3} />
            </span>
          ) : null}

          {/* Streaming Cursor */}
          {message.isStreaming && message.content && (
            <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse bg-accent-400" />
          )}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((citation, index) => (
              <span
                key={`${citation.documentId}-${citation.chunkIndex ?? index}`}
                className="flex items-center gap-1 rounded-full border border-base-700 bg-base-800/60 px-2.5 py-1 text-[11px] text-base-400"
              >
                <FileText className="h-3 w-3 shrink-0" />

                <span className="max-w-56 truncate">
                  {citation.fileName}
                </span>

                {citation.pageNumber != null && (
                  <span className="shrink-0 text-base-500">
                    · p.{citation.pageNumber}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Copy Button */}
        {!isUser &&
          message.content &&
          !message.isStreaming && (
            <button
              onClick={copy}
              type="button"
              className="flex items-center gap-1 self-start rounded px-1 text-[11px] text-base-500 transition-colors hover:text-base-300"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}

              {copied ? "Copied" : "Copy"}
            </button>
          )}
      </div>
    </motion.div>
  );
}

/* Thinking Dot */
function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-1.5 w-1.5 rounded-full bg-base-400"
      animate={{
        opacity: [0.3, 1, 0.3],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        delay,
      }}
    />
  );
}