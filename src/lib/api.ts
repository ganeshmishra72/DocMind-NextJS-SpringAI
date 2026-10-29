import type {
  Citation,
  ChatMessage,
  DocumentDetail,
  DocumentSummary,
  IndexStatus,
  SearchResult,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? "";
    } catch {
      /* no json body */
    }
    throw new ApiError(
      detail || `Request failed with status ${res.status}`,
      res.status
    );
  }
  return res.json() as Promise<T>;
}

function normalizeStatus(
  status: unknown
): IndexStatus {
  const value = String(
    status ?? "INDEXED"
  ).toLowerCase();

  switch (value) {
    case "indexed":
      return "indexed";

    case "processing":
      return "processing";

    case "failed":
      return "failed";

    case "uploading":
      return "uploading";

    default:
      return "uploading";
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDocument(
  raw: any
): DocumentSummary {
  return {
    id: String(raw?.id ?? ""),

    name:
      raw?.fileName ??
      "Untitled document",

    contentType:
      raw?.contentType ??
      "application/octet-stream",

    sizeBytes:
      raw?.fileSize ??
      raw?.filelSize ??
      0,

    chunkCount:
      raw?.totalChunks ??
      raw?.chunksCreated ??
      0,

    pageCount:
      raw?.totalPages ??
      0,

    status: normalizeStatus(
      raw?.status
    ),

    errorMessage:
      raw?.errorMessage ?? null,

    createdAt:
      raw?.createdAt ?? null,

    updatedAt:
      raw?.updatedAt ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeChunk(raw: any, i: number) {
  return {
    id: String(raw.id ?? raw.chunkId ?? i),
    index: raw.index ?? raw.chunkIndex ?? i,
    content: raw.content ?? raw.text ?? "",
    page: raw.page ?? raw.pageNumber,
    score: raw.score ?? raw.similarity,
  };
}

export const docmindApi = {
  async listDocuments(): Promise<DocumentSummary[]> {
    const res = await fetch(`${API_BASE_URL}/documnets`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await handleJson<any>(res);

    if (!response.status) {
      throw new ApiError(
        response.message ??
        "Failed to fetch documents"
      );
    }
    return (
      response.data ?? []
    ).map(normalizeDocument);
  },

  async getDocument(id: string): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE_URL}/documnets/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await handleJson<any>(res);

    const raw = response.data;

    if (!response.status) {
      throw new ApiError(
        response.message ??
        "Failed to fetch document"
      );
    }

    return normalizeDocument(
      response.data
    );
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/documnets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      throw new ApiError(`Failed to delete document`, res.status);
    }
  },

  /**
   * Uploads one file with progress reporting via XHR (fetch has no native
   * upload-progress event yet).
   */
  uploadDocument(
    file: File,
    onProgress: (pct: number) => void
  ): {
    promise: Promise<DocumentSummary>;
    cancel: () => void;
  } {
    const xhr = new XMLHttpRequest();

    const promise = new Promise<DocumentSummary>(
      (resolve, reject) => {
        const form = new FormData();

        form.append("file", file);

        xhr.open(
          "POST",
          `${API_BASE_URL}/documnets/upload`
        );

        xhr.setRequestHeader(
          "Accept",
          "application/json"
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round(
              (e.loaded / e.total) * 100
            );

            onProgress(progress);
          }
        };

        xhr.onload = () => {
          try {
            if (
              xhr.status >= 200 &&
              xhr.status < 300
            ) {
              const response = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : {};

              // Backend:
              // APIResponse<DocumentResponseDTO>
              const document = response.data;

              onProgress(100);

              resolve(
                normalizeDocument(document)
              );
            } else {
              let message = `Upload failed (${xhr.status})`;

              try {
                const response = JSON.parse(
                  xhr.responseText
                );

                message =
                  response?.message || message;
              } catch {
                // Ignore invalid JSON
              }

              reject(
                new ApiError(
                  message,
                  xhr.status
                )
              );
            }
          } catch (error) {
            reject(error);
          }
        };

        xhr.onerror = () => {
          reject(
            new ApiError(
              "Network error during upload"
            )
          );
        };

        xhr.onabort = () => {
          reject(
            new ApiError(
              "Upload cancelled"
            )
          );
        };

        xhr.send(form);
      }
    );

    return {
      promise,
      cancel: () => xhr.abort(),
    };
  },

  uploadMultipleDocuments(
    files: File[],
    onProgress?: (pct: number) => void
  ): Promise<DocumentSummary[]> {
    return new Promise<DocumentSummary[]>(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest();

        const form = new FormData();

        files.forEach((file) => {
          form.append("files", file);
        });

        xhr.open(
          "POST",
          `${API_BASE_URL}/documnets/upload-multiple`
        );

        xhr.setRequestHeader(
          "Accept",
          "application/json"
        );

        xhr.upload.onprogress = (e) => {
          if (
            e.lengthComputable &&
            onProgress
          ) {
            const progress = Math.round(
              (e.loaded / e.total) * 100
            );

            onProgress(progress);
          }
        };

        xhr.onload = () => {
          try {
            if (
              xhr.status >= 200 &&
              xhr.status < 300
            ) {
              const response = xhr.responseText
                ? JSON.parse(xhr.responseText)
                : {};

              // Backend:
              // APIResponse<List<DocumentResponseDTO>>
              const documents =
                response.data ?? [];

              onProgress?.(100);

              resolve(
                documents.map(
                  (document: unknown) =>
                    normalizeDocument(document)
                )
              );
            } else {
              let message = `Multiple upload failed (${xhr.status})`;

              try {
                const response = JSON.parse(
                  xhr.responseText
                );

                message =
                  response?.message || message;
              } catch {
                // Ignore invalid JSON
              }

              reject(
                new ApiError(
                  message,
                  xhr.status
                )
              );
            }
          } catch (error) {
            reject(error);
          }
        };

        xhr.onerror = () => {
          reject(
            new ApiError(
              "Network error during multiple upload"
            )
          );
        };

        xhr.onabort = () => {
          reject(
            new ApiError(
              "Multiple upload cancelled"
            )
          );
        };

        xhr.send(form);
      }
    );
  },
  async search(
    query: string,
    documentId?: string
  ): Promise<SearchResult[]> {
    const res = await fetch(
      `${API_BASE_URL}/chat/search/similarity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          ...(documentId ? { documentId } : {}),
          topK: 2,
          similaritySearch: 0.2,
        }),
      }
    );

    const response = await handleJson<any>(res);

    const data = response.data;

    const list = Array.isArray(data)
      ? data
      : data?.matches ?? [];

    return list.map((r: any) => ({
      documentId: String(r.documentId ?? ""),
      fileName: r.fileName ?? "Document",
      chunkIndex: r.chunkIndex,
      snippet: r.snippet ?? "",
      similarityScore: Number(r.similarityScore ?? 0),
      pageNumbee: r.pageNumbee,
      metadata: r.metadata,
    }));
  },
  /** Non-streaming chat call, used as a fallback when streaming is off. */
  async chat(
    question: string,
    scope?: string
  ): Promise<{ content: string; citations: Citation[] }> {
    const res = await fetch(`${API_BASE_URL}/chat/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question.trim(),
        documentId:
          scope && scope !== "all"
            ? scope
            : null,
        topK: 3,
        minSimilarity: 0.15,
        conversationalId: null,
      }),
    });

    const response = await handleJson<any>(res);

    const data = response?.data;

    return {
      content: data?.answer ?? "",

      citations: Array.isArray(data?.citation)
        ? data.citation.map((c: any): Citation => ({
          documentId:
            c.documentId ??
            c.metadata?.documentId ??
            "",

          fileName:
            c.fileName ??
            c.metadata?.fileName ??
            "Document",

          chunkIndex:
            c.chunkIndex ??
            c.metadata?.chunkIndex ??
            0,

          pageNumber:
            c.pageNumber ??
            c.pageNumbee ??
            c.metadata?.pageNumber ??
            undefined,

          snippet: c.snippet ?? "",

          similarityScore:
            c.similarityScore ??
            0,

          metadata:
            c.metadata ?? {},
        }))
        : [],
    };
  },

  /**
   * Streams chat tokens from POST /api/chat/stream, which is expected to
   * respond with a `text/event-stream` (SSE-style `data: ...` lines) or
   * plain chunked text. Falls back to the non-streaming endpoint if the
   * stream route 404s.
   */
  async chatStream(
    question: string,
    scope: string | undefined,
    onToken: (token: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/chat/stream/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, scope }),
      signal,
    });

    if (res.status === 404) {
      const fallback = await docmindApi.chat(question, scope);
      onToken(fallback.content);
      return;
    }
    if (!res.ok || !res.body) {
      throw new ApiError(`Chat stream failed (${res.status})`, res.status);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const payload = trimmed.startsWith("data:")
          ? trimmed.slice(5).trim()
          : trimmed;
        if (payload === "[DONE]") continue;
        try {
          const parsed = JSON.parse(payload);
          onToken(parsed.token ?? parsed.content ?? parsed.delta ?? "");
        } catch {
          onToken(payload);
        }
      }
    }
  },
};
