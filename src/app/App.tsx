import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';

// App pages (protected)
import DashboardPage from './pages/DashboardPage';
import PendingInputsPage from './pages/PendingInputsPage';
import ActivitiesListPage from './pages/ActivitiesListPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import UnsynchronizedDetailPage from './pages/UnsynchronizedDetailPage';
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineWizardPage from './pages/PipelineWizardPage';
import PipelineEditPage from './pages/PipelineEditPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useFCM } from './hooks/useFCM';
import { NerdModeProvider } from './state/NerdModeContext';

// Protected route wrapper - redirects to static /auth/login page
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    // Redirect to static auth page (outside React app)
    window.location.href = '/auth/login';
    return <div className="container">Redirecting to login...</div>;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [, setUser] = useAtom(userAtom);
  const [, setLoading] = useAtom(authLoadingAtom);

  useFCM();

  useEffect(() => {
    const setup = async () => {
      const fb = await initFirebase();
      if (!fb) {
        setLoading(false);
        return;
      }

      onAuthStateChanged(fb.auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    };

    setup();
  }, [setUser, setLoading]);

  return (
    <NerdModeProvider>
      <Router basename="/app">
        <Routes>
          {/* Protected app routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/inputs" element={<ProtectedRoute><PendingInputsPage /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute><ActivitiesListPage /></ProtectedRoute>} />
          <Route path="/activities/unsynchronized/:pipelineExecutionId" element={<ProtectedRoute><UnsynchronizedDetailPage /></ProtectedRoute>} />
          <Route path="/activities/:id" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
          <Route path="/settings/pipelines" element={<ProtectedRoute><PipelinesPage /></ProtectedRoute>} />
          <Route path="/settings/pipelines/new" element={<ProtectedRoute><PipelineWizardPage /></ProtectedRoute>} />
          <Route path="/settings/pipelines/:pipelineId/edit" element={<ProtectedRoute><PipelineEditPage /></ProtectedRoute>} />
          <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </NerdModeProvider>
  );
};

export default App;

