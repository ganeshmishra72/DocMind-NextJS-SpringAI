"use client";

import { BookOpen, Search, ExternalLink, Sun, Moon } from "lucide-react";
import { useState } from "react";

export function Header({
  documentCount,
  scope,
  documentName,
  onOpenSearch,
}: {
  documentCount: number;
  scope?: string;
  documentName?: string;
  onOpenSearch: () => void;
}) {
  const [dark, setDark] = useState(true);
  const swaggerUrl =
    (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080") +
    "/swagger-ui/index.html";
   console.log(scope +" "+ documentName);
   
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-base-700 bg-base-900 px-5">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white">
          <BookOpen className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-base-900 bg-emerald-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-base-100">DocMind</h1>
            <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-[10px] font-medium text-accent-300">
              AI RAG
            </span>
          </div>
          <p className="text-[11px] text-base-500">Spring AI · PostgreSQL pgvector · OpenAI</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-base-700 bg-base-800/60 px-3 py-1.5 text-xs text-base-300 md:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
        Scope:  <span className="max-w-48 truncate font-medium text-base-100">
    {scope && documentName
      ? documentName
      : `All Documents (${documentCount})`}
  </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-lg border border-base-700 bg-base-800/60 px-3 py-2 text-xs text-base-400 hover:border-base-600 hover:text-base-200 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          Search Chunks
          <kbd className="rounded border border-base-600 bg-base-750 px-1.5 py-0.5 text-[10px] text-base-400">⌘K</kbd>
        </button>
        <a
          href={swaggerUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-lg border border-base-700 px-3 py-2 text-xs text-base-400 hover:border-base-600 hover:text-base-200 transition-colors sm:flex"
        >
          Swagger API
          <ExternalLink className="h-3 w-3" />
        </a>
        <button
          onClick={() => setDark((d) => !d)}
          className="rounded-lg border border-base-700 p-2 text-base-400 hover:border-base-600 hover:text-base-200 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
