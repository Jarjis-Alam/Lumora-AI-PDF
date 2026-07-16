import { create } from 'zustand';
import type { Document, ChatMessage, Flashcard } from './types';

export type View = 'documents' | 'chat' | 'summary' | 'flashcards' | 'quiz' | 'graph' | 'search';
export type WorkspaceTab = 'chat' | 'summary' | 'flashcards' | 'quiz' | 'graph' | 'search';

interface LumoraState {
  documents: Document[];
  activeDocId: string | null;
  view: View;
  workspaceTab: WorkspaceTab;
  searchQuery: string;
  graphNodeHighlight: string | null;
  pdfPage: number;
  pdfZoom: number;
  pdfHighlight: { page: number; paragraph: number } | null;
  isDocumentsLoading: boolean;

  setView: (v: View) => void;
  setWorkspaceTab: (t: WorkspaceTab) => void;
  selectDocument: (id: string | null) => void;
  openDocument: (id: string) => void;
  addDocument: (name: string, size: number, fileObj?: File) => string;
  removeDocument: (id: string) => void;
  renameDocument: (id: string, name: string) => void;
  setPdfPage: (p: number) => void;
  setPdfZoom: (z: number) => void;
  setPdfHighlight: (h: { page: number; paragraph: number } | null) => void;
  setGraphNodeHighlight: (id: string | null) => void;
  setSearchQuery: (q: string) => void;

  addChatMessage: (docId: string, msg: ChatMessage) => void;
  updateChatMessage: (docId: string, msgId: string, patch: Partial<ChatMessage>) => void;
  clearChat: (docId: string) => void;

  generateSummary: (docId: string) => void;
  generateFlashcards: (docId: string) => void;
  generateQuiz: (docId: string) => void;
  generateGraph: (docId: string) => void;

  editFlashcard: (docId: string, cardId: string, patch: Partial<Flashcard>) => void;
  deleteFlashcard: (docId: string, cardId: string) => void;
  addFlashcard: (docId: string, card: Flashcard) => void;

  fetchDocuments: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error('[Lumora] VITE_API_BASE_URL is not set. API requests will fail.');
}

function updateDoc(docs: Document[], id: string, fn: (d: Document) => Document): Document[] {
  return docs.map((d) => (d.id === id ? fn(d) : d));
}

/* ─── Simple cache for documents API data ─── */
let _cachedDocuments: Document[] | null = null;
let _cachedDocumentsAt = 0;
const CACHE_TTL = 30_000; // 30 seconds stale-while-revalidate window

/* ─── Chunk cache for PdfViewer ─── */
const _chunkCache = new Map<string, { page: number; paragraph: number; text: string }[]>();
export function getCachedChunks(docId: string) {
  return _chunkCache.get(docId) ?? null;
}
export function setCachedChunks(docId: string, chunks: { page: number; paragraph: number; text: string }[]) {
  _chunkCache.set(docId, chunks);
}

const pollDocumentStatus = (docId: string) => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}`);
      if (res.ok) {
        const doc = await res.json();
        useStore.setState((s) => ({
          documents: s.documents.map((d) => (d.id === docId ? doc : d)),
        }));

        if ((doc.status === 'ready' && doc.progress >= 100) || doc.status === 'error' || doc.status === 'failed') {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    } catch (e) {
      console.error(e);
      clearInterval(interval);
    }
  }, 2500);
};

export const useStore = create<LumoraState>((set) => ({
  documents: [],
  activeDocId: null,
  view: 'documents',
  workspaceTab: 'chat',
  searchQuery: '',
  graphNodeHighlight: null,
  pdfPage: 1,
  pdfZoom: 1,
  pdfHighlight: null,
  isDocumentsLoading: true,

  setView: (v) => set({ view: v }),
  setWorkspaceTab: (t) => set({ workspaceTab: t }),
  selectDocument: (id) => set({ activeDocId: id }),
  openDocument: (id) =>
    set(() => ({
      activeDocId: id,
      view: 'documents',
      workspaceTab: 'chat',
      pdfPage: 1,
      pdfHighlight: null,
    })),

  addDocument: (name, size, fileObj) => {
    const tempId = `temp-${Date.now()}`;
    const tempDoc: Document = {
      id: tempId,
      name,
      size: Math.round(size * 1024 * 1024),
      uploadedAt: Date.now(),
      lastOpenedAt: null,
      status: 'processing',
      progress: 0,
      summary: null,
      flashcards: [],
      quiz: [],
      graph: null,
      chat: [],
      bookmarks: [],
      pages: 0,
      accent: '#C0392B',
    };

    set((s) => ({ documents: [tempDoc, ...s.documents] }));

    (async () => {
      try {
        const formData = new FormData();
        if (fileObj) {
          formData.append('file', fileObj, fileObj.name);
        } else {
          const mockBlob = new Blob(['PDF_MOCK_CONTENT'], { type: 'application/pdf' });
          formData.append('file', mockBlob, name + '.pdf');
        }

        const res = await fetch(`${API_BASE}/documents`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const realDoc = await res.json();
          set((s) => ({
            documents: s.documents.map((d) => (d.id === tempId ? realDoc : d)),
            activeDocId: s.activeDocId === tempId ? realDoc.id : s.activeDocId,
          }));
          // Update cache
          _cachedDocuments = useStore.getState().documents;
          _cachedDocumentsAt = Date.now();

          pollDocumentStatus(realDoc.id);
        } else {
          set((s) => ({
            documents: updateDoc(s.documents, tempId, (d) => ({ ...d, status: 'error', progress: 100 })),
          }));
        }
      } catch (e) {
        console.error(e);
        set((s) => ({
          documents: updateDoc(s.documents, tempId, (d) => ({ ...d, status: 'error', progress: 100 })),
        }));
      }
    })();

    return tempId;
  },

  /* ─── Optimistic removeDocument ─── */
  removeDocument: async (id) => {
    // Snapshot for rollback
    const snapshot = useStore.getState().documents;
    // Optimistic: remove immediately
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocId: s.activeDocId === id ? null : s.activeDocId,
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        // Rollback on failure
        set({ documents: snapshot });
      } else {
        // Update cache
        _cachedDocuments = useStore.getState().documents;
        _cachedDocumentsAt = Date.now();
      }
    } catch (e) {
      console.error(e);
      // Rollback on error
      set({ documents: snapshot });
    }
  },

  /* ─── Optimistic renameDocument ─── */
  renameDocument: async (id, name) => {
    // Snapshot for rollback
    const snapshot = useStore.getState().documents;
    // Optimistic: apply rename immediately
    set((s) => ({
      documents: updateDoc(s.documents, id, (d) => ({ ...d, name })),
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        set((s) => ({
          documents: updateDoc(s.documents, id, () => updatedDoc),
        }));
        _cachedDocuments = useStore.getState().documents;
        _cachedDocumentsAt = Date.now();
      } else {
        set({ documents: snapshot });
      }
    } catch (e) {
      console.error(e);
      set({ documents: snapshot });
    }
  },

  setPdfPage: (p) => set({ pdfPage: p }),
  setPdfZoom: (z) => set({ pdfZoom: z }),
  setPdfHighlight: (h) => set({ pdfHighlight: h }),
  setGraphNodeHighlight: (id) => set({ graphNodeHighlight: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addChatMessage: (docId, msg) => {
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({ ...d, chat: [...d.chat, msg] })),
    }));

    if (msg.role === 'user') {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/documents/${docId}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: msg.content }),
          });
          if (res.ok) {
            const doc = await res.json();
            set((s) => ({
              documents: updateDoc(s.documents, docId, () => doc),
            }));
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
  },

  updateChatMessage: (docId, msgId, patch) =>
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({
        ...d,
        chat: d.chat.map((m) => (m.id === msgId ? { ...m, ...patch } : m)),
      })),
    })),

  /* ─── Optimistic clearChat ─── */
  clearChat: async (docId) => {
    const snapshot = useStore.getState().documents;
    // Optimistic: clear chat immediately
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({ ...d, chat: [] })),
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/chat`, { method: 'DELETE' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({
          documents: updateDoc(s.documents, docId, () => doc),
        }));
      } else {
        set({ documents: snapshot });
      }
    } catch (e) {
      console.error(e);
      set({ documents: snapshot });
    }
  },

  generateSummary: async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/summary`, { method: 'POST' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  generateFlashcards: async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards`, { method: 'POST' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  generateQuiz: async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/quiz`, { method: 'POST' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  generateGraph: async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/graph`, { method: 'POST' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  /* ─── Optimistic editFlashcard ─── */
  editFlashcard: async (docId, cardId, patch) => {
    const snapshot = useStore.getState().documents;
    // Optimistic: apply edit immediately
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({
        ...d,
        flashcards: d.flashcards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
      })),
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      } else {
        set({ documents: snapshot });
      }
    } catch (e) {
      console.error(e);
      set({ documents: snapshot });
    }
  },

  /* ─── Optimistic deleteFlashcard ─── */
  deleteFlashcard: async (docId, cardId) => {
    const snapshot = useStore.getState().documents;
    // Optimistic: remove card immediately
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({
        ...d,
        flashcards: d.flashcards.filter((c) => c.id !== cardId),
      })),
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards/${cardId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      } else {
        set({ documents: snapshot });
      }
    } catch (e) {
      console.error(e);
      set({ documents: snapshot });
    }
  },

  /* ─── Optimistic addFlashcard ─── */
  addFlashcard: async (docId, card) => {
    // Optimistic: add card immediately
    set((s) => ({
      documents: updateDoc(s.documents, docId, (d) => ({
        ...d,
        flashcards: [...d.flashcards, card],
      })),
    }));

    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front: card.front, back: card.back }),
      });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  /* ─── fetchDocuments with stale-while-revalidate cache ─── */
  fetchDocuments: async () => {
    // Serve from cache instantly if available
    if (_cachedDocuments && Date.now() - _cachedDocumentsAt < CACHE_TTL) {
      set({ documents: _cachedDocuments, isDocumentsLoading: false });
    }

    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (res.ok) {
        const documents = await res.json();
        _cachedDocuments = documents;
        _cachedDocumentsAt = Date.now();
        set({ documents, isDocumentsLoading: false });
        // Start polling for any document that is currently processing
        documents.forEach((doc: Document) => {
          if (doc.status === 'processing') {
            pollDocumentStatus(doc.id);
          }
        });
      } else {
        set({ isDocumentsLoading: false });
      }
    } catch (e) {
      console.error(e);
      set({ isDocumentsLoading: false });
    }
  },
}));

// Clear stale cache on startup for a fresh session
_cachedDocuments = null;
_cachedDocumentsAt = 0;
