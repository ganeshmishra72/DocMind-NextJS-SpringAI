"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { UploadCloud, Search as SearchIcon, Files, FileText, Database } from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { ChatScope, DocumentSummary } from "@/lib/types";

export function Sidebar({
  documents,
  loading,
  scope,
  onScopeChange,
  onOpenUpload,
  onOpenDocument,
}: {
  documents: DocumentSummary[];
  loading: boolean;
  scope?: ChatScope;
  onScopeChange: (scope?: ChatScope) => void;
  onOpenUpload: () => void;
  onOpenDocument: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () =>
      documents.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase())),
    [documents, filter]
  );

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-base-700 bg-base-900">
      <div className="border-b border-base-700 px-4 py-4">
        <div className="flex items-center gap-2 text-base-100">
          <Database className="h-4 w-4 text-accent-400" />
          <h2 className="text-sm font-semibold">Knowledge Base</h2>
        </div>
        <p className="mt-0.5 text-xs text-base-500">Indexed vector documents</p>
      </div>

      <div className="p-4">
        <button
          onClick={onOpenUpload}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-base-700 px-4 py-6 text-center transition-colors hover:border-accent-500/50 hover:bg-accent-500/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800 text-accent-400">
            <UploadCloud className="h-4.5 w-4.5" />
          </div>
          <p className="text-xs text-base-300">
            <span className="font-medium text-accent-400">Upload document</span> or drag here
          </p>
          <p className="text-[11px] text-base-500">PDF, Word, Markdown, TXT, CSV (max 25MB)</p>
        </button>
      </div>

      <div className="px-4">
        <button
  onClick={() => onScopeChange(undefined)}
  className={cn(
    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
    !scope
      ? "border-accent-500/40 bg-accent-500/10"
      : "border-base-700 hover:bg-base-800/60"
  )}
>
         <div
  className={cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
    !scope
      ? "bg-accent-500 text-white"
      : "bg-base-800 text-base-400"
  )}
>
            <Files className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-base-100">All Documents</p>
            <p className="text-xs text-base-500">Search across complete corpus</p>
          </div>
          <span className="ml-auto shrink-0 rounded-full bg-base-750 px-2 py-0.5 text-xs font-medium text-base-300">
            {documents.length}
          </span>
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 rounded-lg border border-base-700 bg-base-800/50 px-2.5 py-1.5">
          <SearchIcon className="h-3.5 w-3.5 text-base-500" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-transparent text-xs text-base-200 placeholder:text-base-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-4 text-[11px] font-medium uppercase tracking-wide text-base-500">
        <span>Documents ({documents.length})</span>
        <span>Status</span>
      </div>

      <div className="mt-1 flex-1 space-y-1.5 overflow-y-auto px-4 pb-4">
        {loading && (
          <div className="space-y-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-base-800/60" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="pt-6 text-center text-xs text-base-500">
            {documents.length === 0 ? "No documents yet — upload one to get started." : "No files match your filter."}
          </p>
        )}

        {filtered.map((doc) => (
          <motion.button
            key={doc.id}
            layout
             onClick={() => {
    onScopeChange(doc.id);
    onOpenDocument(doc.id);
  }}
            className={cn(
              "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
              scope === doc.id
                ? "border-accent-500/40 bg-accent-500/10"
                : "border-base-700 bg-base-800/40 hover:bg-base-800/70"
            )}
          >
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-base-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-base-100">{doc.name}</p>
                <p className="text-xs text-base-500">
                  {formatBytes(doc.sizeBytes)} · {doc.pageCount || 1}p
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-base-500">{doc.chunkCount} chunks</span>
              <StatusBadge status={doc.status} />
            </div>
          </motion.button>
        ))}
      </div>
    </aside>
  );
}
