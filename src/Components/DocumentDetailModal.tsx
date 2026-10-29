"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, FileText, Layers, BookOpen, Calendar, Trash2, MessageSquareText, Copy, Loader2 } from "lucide-react";
import { docmindApi } from "@/lib/api";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { DocumentDetail, DocumentSummary } from "@/lib/types";

export function DocumentDetailModal({
  documentId,
  onClose,
  onDeleted,
  onChatWithDocument,
}: {
  documentId: string | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onChatWithDocument: (id: string) => void;
}) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset detail state when the modal closes
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    docmindApi
      .getDocument(documentId)
      .then((d) => !cancelled && setDetail(d))
      .catch((err) => !cancelled && setError(err.message ?? "Couldn't load this document"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <AnimatePresence>
      {documentId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-base-700 bg-base-850 glow-ring"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-base-700 px-6 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-base-100">
                    {detail?.name ?? "Loading…"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    {detail && (
                      <>
                        <button
                          onClick={() => copyId(detail.id)}
                          className="flex items-center gap-1 rounded text-xs text-base-500 hover:text-base-300"
                        >
                          {detail.id.slice(0, 8)}…
                          <Copy className="h-3 w-3" />
                        </button>
                        {copiedId === detail.id && (
                          <span className="text-[11px] text-emerald-400">Copied</span>
                        )}
                        <StatusBadge status={detail.status} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-base-400 hover:bg-base-750 hover:text-base-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex h-48 items-center justify-center gap-2 text-base-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading document…
                </div>
              )}
              {error && (
                <div className="p-6 text-sm text-red-400">{error}</div>
              )}
              {detail && !loading && (
                <>
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4">
                    <Stat icon={FileText} label="File size" value={formatBytes(detail.sizeBytes)} />
                    <Stat icon={Layers} label="Vector chunks" value={`${detail.chunkCount} chunks`} />
                    <Stat icon={BookOpen} label="Total pages" value={`${detail.pageCount} pages`} />
                    <Stat icon={Calendar} label="Uploaded" value={formatDate(detail.createdAt ?? detail.updatedAt ?? "")} />
                  </div>

  <div className="border-t border-base-700 px-6 py-5">
  <div className="mb-3 flex items-center justify-between">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-base-400">
      Indexed vector chunks
    </h3>

    <span className="text-xs text-base-500">
      {detail.chunkCount} chunks
    </span>
  </div>

  <div className="space-y-3">
    {detail.chunkCount === 0 ? (
      <p className="text-sm text-base-500">
        No chunks available for this document.
      </p>
    ) : (
      <p className="text-sm text-base-500">
        {detail.chunkCount} vector chunks have been indexed for this
        document. Open the Vector Chunks view to explore their content.
      </p>
    )}
  </div>
</div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-base-700 px-6 py-4">
              <button
                disabled={!detail || deleting}
                onClick={async () => {
                  if (!detail) return;
                  setDeleting(true);
                  await onDeleted(detail.id);
                  setDeleting(false);
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors",
                  (!detail || deleting) && "opacity-50 cursor-not-allowed"
                )}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting…" : "Delete document"}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-base-300 hover:bg-base-750 hover:text-base-100 transition-colors"
                >
                  Close
                </button>
                <button
                  disabled={!detail}
                  onClick={() => detail && onChatWithDocument(detail.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500 transition-colors disabled:opacity-50"
                >
                  <MessageSquareText className="h-4 w-4" />
                  Chat with document
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-800/50 px-3.5 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-base-500">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-sm font-semibold text-base-100">{value}</p>
    </div>
  );
}
