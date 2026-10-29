export type IndexStatus =
  | "indexed"
  | "processing"
  | "failed"
  | "uploading";


export interface DocumentChunk {
  id: string;
  index: number;
  content: string;
  page?: number;
  score?: number;
}

export interface DocumentSummary {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  chunkCount: number;
  pageCount: number;
  status: IndexStatus;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DocumentResponse {
  id: string;
  fileName: string;
  filelSize: number;
  status: IndexStatus;
  chunksCreated: number;
  message: string;
}


export interface DocumentDetail
  extends DocumentSummary { }

export interface Citation {
  documentId: string;
  fileName: string;
  chunkIndex: number;
  pageNumber?: number;
  snippet: string;
  similarityScore?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  answer: string;
  converstation: string;
  citation: Citation[];
  responseTime: number;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface SearchResult {
  chunkId: string;
  documentId: string;
  fileName: string;
  chunkIndex?: number;
  snippet: string;
  similarityScore: number;
  pageNumbee?: number;
  metadata?: Record<string, unknown>;
}

export interface PromptTemplate {
  id: string;
  icon: "file" | "help" | "list" | "search";
  title: string;
  description: string;
  prompt: string;
}

export type ChatScope = string | undefined;
