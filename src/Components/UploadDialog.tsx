"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { docmindApi } from "@/lib/api";
import type { DocumentSummary } from "@/lib/types";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  cancel?: () => void;
}

const ACCEPTED = ".pdf,.doc,.docx,.md,.txt,.csv";
const MAX_MB = 25;

export function UploadDialog({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (doc: DocumentSummary) => void;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startUpload = useCallback(
    (item: UploadItem) => {
      const { promise, cancel } = docmindApi.uploadDocument(item.file, (pct) => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, progress: pct } : i))
        );
      });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", cancel } : i))
      );
      promise
        .then((doc) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "done", progress: 100 } : i))
          );
          onUploaded(doc);
        })
        .catch((err) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "error", error: err?.message ?? "Upload failed" }
                : i
            )
          );
        });
    },
    [onUploaded]
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.size <= MAX_MB * 1024 * 1024);
      const newItems: UploadItem[] = files.map((file) => ({
        id: Math.random().toString(36).slice(2),
        file,
        progress: 0,
        status: "pending",
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach(startUpload);
    },
    [startUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      target?.cancel?.();
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClose = () => {
    setItems([]);
    onClose();
  };

  const allDone = items.length > 0 && items.every((i) => i.status === "done" || i.status === "error");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl border border-base-700 bg-base-850 glow-ring overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-base-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-base-100">Upload documents</h2>
                  <p className="text-xs text-base-400">PDF, Word, Markdown, TXT, CSV · max {MAX_MB}MB</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-base-400 hover:bg-base-750 hover:text-base-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  isDragging
                    ? "border-accent-400 bg-accent-500/5"
                    : "border-base-700 hover:border-base-600 hover:bg-base-800/50"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-800 text-accent-400">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm text-base-200">
                  <span className="font-medium text-accent-400">Upload documents</span> or drag here
                </p>
                <p className="text-xs text-base-500">Multiple files supported</p>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED}
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>

              {items.length > 0 && (
                <div className="mt-5 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-base-700 bg-base-800/60 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-base-750 text-base-300">
                          {item.status === "done" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : item.status === "error" ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-medium text-base-100">{item.file.name}</p>
                            <span className="shrink-0 text-[11px] text-base-500">
                              {formatBytes(item.file.size)}
                            </span>
                          </div>
                          {item.status === "error" ? (
                            <p className="mt-0.5 text-[11px] text-red-400">{item.error}</p>
                          ) : (
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-base-700">
                              <motion.div
                                className={cn(
                                  "h-full rounded-full",
                                  item.status === "done" ? "bg-emerald-500" : "bg-accent-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                transition={{ ease: "easeOut", duration: 0.25 }}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 rounded p-1 text-base-500 hover:bg-base-700 hover:text-base-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-base-700 px-6 py-4">
              <button
                onClick={handleClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-base-300 hover:bg-base-750 hover:text-base-100 transition-colors"
              >
                {allDone ? "Done" : "Close"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
