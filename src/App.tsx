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
import { DocsPage } from './pages/DocsPage';
import { LicensePage } from './pages/LicensePage';
import { ChangelogPage } from './pages/ChangelogPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: Infinity } },
});

import { SplashTransition } from './components/SplashTransition';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SplashTransition>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/license" element={<LicensePage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
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
      </SplashTransition>
    </QueryClientProvider>
  );
}
