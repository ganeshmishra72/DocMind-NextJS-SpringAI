"use client"
import { useChat } from '@/hooks/useChat';
import { useDocuments } from '@/hooks/useDocuments';
import { ChatScope } from '@/lib/types';
import React, { useEffect, useState } from 'react'
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChatPanel } from './ChatPanel';
import { UploadDialog } from './UploadDialog';
import { SearchModal } from './SearchModal';
import { DocumentDetailModal } from './DocumentDetailModal';

const Home = () => {
 const { documents, loading, error, addOrUpdate, remove } = useDocuments();
 const [scope, setScope] = useState<string | undefined>(undefined);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(true);
  
  const { messages, isThinking, send, stop, clear } = useChat(scope);
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  
const selectedDocument = documents.find((d) => d.id === scope);

const scopeLabel = selectedDocument
  ? selectedDocument.name
  : `All Documents (${documents.length})`;
  
    console.log("DOCUMENTS:", documents);
console.log("SCOPE:", scope);
console.log(
  "SELECTED:",
  documents.find((d) => d.id === scope)
);
  return (
    <main className="flex h-full w-full flex-col">
      <Header
  documentCount={documents.length}
  scope={scopeLabel}
  onOpenSearch={() => setSearchOpen(true)}
/>
  
      <div className="flex min-h-0 flex-1">
        <Sidebar
          documents={documents}
          loading={loading}
          scope={scope}
          onScopeChange={setScope}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenDocument={setActiveDocId}
        />
  
        <ChatPanel
          scopeLabel={scopeLabel}
          messages={messages}
          isThinking={isThinking}
          onSend={send}
          onStop={stop}
          onClear={clear}
          streaming={streaming}
          onToggleStreaming={() => setStreaming((s) => !s)}
        />
      </div>
  
      {error && documents.length === 0 && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          Couldn&apos;t reach the DocMind backend at{" "}
          {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"} — {error}
        </div>
      )}
  
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={addOrUpdate}
      />
  
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} scope={scope} />
  
      <DocumentDetailModal
        documentId={activeDocId}
        onClose={() => setActiveDocId(null)}
        onDeleted={remove}
        onChatWithDocument={(id) => {
          setScope(id);
          setActiveDocId(null);
        }}
      />
    </main>
  )
}

export default Home
