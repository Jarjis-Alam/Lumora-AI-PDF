import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Landing } from './pages/Landing';
import { AppLayout } from './pages/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Workspace } from './pages/Workspace';
import { ChatPage } from './pages/ChatPage';
import { SummaryPage } from './pages/SummaryPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { GraphPage } from './pages/GraphPage';
import { SearchPage } from './pages/SearchPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: Infinity } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="workspace" element={<Workspace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="graph" element={<GraphPage />} />
            <Route path="search" element={<SearchPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
