"use client";

import { useCallback, useEffect, useState } from "react";
import { docmindApi } from "@/lib/api";
import type { DocumentSummary } from "@/lib/types";

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const list = await docmindApi.listDocuments();
      setDocuments(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the DocMind backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, [refresh]);

  const addOrUpdate = useCallback((doc: DocumentSummary) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx === -1) return [doc, ...prev];
      const next = [...prev];
      next[idx] = doc;
      return next;
    });
  }, []);

  const remove = useCallback(async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await docmindApi.deleteDocument(id);
    } catch {
      // put it back if the delete failed server-side
      refresh();
    }
  }, [refresh]);

  return { documents, loading, error, refresh, addOrUpdate, remove };
}
