import { create } from 'zustand';
import type { Document, ChatMessage, Flashcard } from './types';

export type View = 'documents' | 'chat' | 'summary' | 'flashcards' | 'quiz' | 'graph' | 'search';

interface LumoraState {
  documents: Document[];
  activeDocId: string | null;
  view: View;
  bottomTab: 'summary' | 'flashcards' | 'quiz' | 'graph';
  searchQuery: string;
  graphNodeHighlight: string | null;
  pdfPage: number;
  pdfZoom: number;
  pdfHighlight: { page: number; paragraph: number } | null;

  setView: (v: View) => void;
  setBottomTab: (t: 'summary' | 'flashcards' | 'quiz') => void;
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

const API_BASE = 'http://localhost:8000/api';

function updateDoc(docs: Document[], id: string, fn: (d: Document) => Document): Document[] {
  return docs.map((d) => (d.id === id ? fn(d) : d));
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

        if (doc.status === 'ready' || doc.status === 'failed') {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    } catch (e) {
      console.error(e);
      clearInterval(interval);
    }
  }, 1000);
};

export const useStore = create<LumoraState>((set) => ({
  documents: [],
  activeDocId: null,
  view: 'documents',
  bottomTab: 'summary',
  searchQuery: '',
  graphNodeHighlight: null,
  pdfPage: 1,
  pdfZoom: 1,
  pdfHighlight: null,

  setView: (v) => set({ view: v }),
  setBottomTab: (t) => set({ bottomTab: t }),
  selectDocument: (id) => set({ activeDocId: id }),
  openDocument: (id) =>
    set((s) => ({
      activeDocId: id,
      view: 'documents',
      pdfPage: 1,
      pdfHighlight: null,
      documents: updateDoc(s.documents, id, (d) => ({ ...d, lastOpenedAt: Date.now() })),
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

          pollDocumentStatus(realDoc.id);
        } else {
          set((s) => ({
            documents: updateDoc(s.documents, tempId, (d) => ({ ...d, status: 'failed', progress: 100 })),
          }));
        }
      } catch (e) {
        console.error(e);
        set((s) => ({
          documents: updateDoc(s.documents, tempId, (d) => ({ ...d, status: 'failed', progress: 100 })),
        }));
      }
    })();

    return tempId;
  },

  removeDocument: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((s) => ({
          documents: s.documents.filter((d) => d.id !== id),
          activeDocId: s.activeDocId === id ? null : s.activeDocId,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  renameDocument: async (id, name) => {
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
      }
    } catch (e) {
      console.error(e);
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

  clearChat: async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/chat`, { method: 'DELETE' });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({
          documents: updateDoc(s.documents, docId, () => doc),
        }));
      }
    } catch (e) {
      console.error(e);
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

  editFlashcard: async (docId, cardId, patch) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  deleteFlashcard: async (docId, cardId) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${docId}/flashcards/${cardId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const doc = await res.json();
        set((s) => ({ documents: updateDoc(s.documents, docId, () => doc) }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  addFlashcard: async (docId, card) => {
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

  fetchDocuments: async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (res.ok) {
        const documents = await res.json();
        set({ documents });
        // Start polling for any document that is currently processing
        documents.forEach((doc: Document) => {
          if (doc.status === 'processing') {
            pollDocumentStatus(doc.id);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  },
}));

// Fetch documents automatically on startup
useStore.getState().fetchDocuments();
