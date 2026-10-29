"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, Sparkles, Loader2, FileText } from "lucide-react";
import { docmindApi } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SearchModal({
  open,
  onClose,
  scope,
}: {
  open: boolean;
  onClose: () => void;
  scope?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset search state when the modal closes
      setQuery("");
      setResults(null);
      setError(null);
    }
  }, [open]);

  const runSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await docmindApi.search(q.trim(), scope);
        setResults(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-base-700 bg-base-850 glow-ring"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-base-700 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
                <Search className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-base-100">Semantic Vector Similarity Search</h2>
              <button
                onClick={onClose}
                className="ml-auto rounded-lg p-1.5 text-base-400 hover:bg-base-750 hover:text-base-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-base-700 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-accent-500/40 bg-base-800/60 px-3.5 py-2.5 focus-within:border-accent-400 transition-colors">
                <Search className="h-4 w-4 shrink-0 text-base-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    runSearch(e.target.value);
                  }}
                  placeholder="Search concepts, clauses, or facts across vector chunks…"
                  className="w-full bg-transparent text-sm text-base-100 placeholder:text-base-500 outline-none"
                />
                {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent-400" />}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!query.trim() && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Sparkles className="h-8 w-8 text-base-600" />
                  <p className="text-sm text-base-500">
                    Type a search term above to inspect matching vector chunks.
                  </p>
                </div>
              )}

              {error && <p className="px-1 py-4 text-sm text-red-400">{error}</p>}

              {results && results.length === 0 && !loading && !error && (
                <p className="px-1 py-4 text-sm text-base-500">
                  No chunks matched “{query}”. Try a broader phrase.
                </p>
              )}

              <div className="space-y-2.5">
                {results?.map((r, index) => (
  <motion.div
    key={`${r.documentId}-${r.chunkIndex ?? index}`}
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-lg border border-base-700 bg-base-800/50 p-3.5"
  >
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-base-300">
        <FileText className="h-3.5 w-3.5 shrink-0 text-base-500" />

        <span className="truncate">
          {r.fileName}
        </span>

        {r.pageNumbee != null && (
          <span className="shrink-0 text-base-500">
            · p.{r.pageNumbee}
          </span>
        )}
      </span>

      <span
        className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
          r.similarityScore > 0.75
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-accent-500/30 bg-accent-500/10 text-accent-300"
        )}
      >
        {(r.similarityScore * 100).toFixed(1)}% match
      </span>
    </div>

    <p className="font-mono text-[13px] leading-relaxed text-base-300 line-clamp-4">
      {r.snippet}
    </p>
  </motion.div>
))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
