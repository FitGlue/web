import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';
import DashboardPage from './pages/DashboardPage';
import PendingInputsPage from './pages/PendingInputsPage';
import ActivitiesListPage from './pages/ActivitiesListPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import UnsynchronizedDetailPage from './pages/UnsynchronizedDetailPage';
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineWizardPage from './pages/PipelineWizardPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import { useFCM } from './hooks/useFCM';
import { NerdModeProvider } from './state/NerdModeContext';

const App: React.FC = () => {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(authLoadingAtom);

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

        if (!u && !window.location.pathname.includes('login')) {
          // If not logged in, redirect to static login page
          window.location.href = '/login';
        }
      });
    };

    setup();
  }, [setUser, setLoading]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <NerdModeProvider>
      <Router basename="/app">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inputs" element={<PendingInputsPage />} />
          <Route path="/activities" element={<ActivitiesListPage />} />
          <Route path="/activities/unsynchronized/:pipelineExecutionId" element={<UnsynchronizedDetailPage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/integrations" element={<IntegrationsPage />} />
          <Route path="/settings/pipelines" element={<PipelinesPage />} />
          <Route path="/settings/pipelines/new" element={<PipelineWizardPage />} />
          <Route path="/settings/account" element={<AccountSettingsPage />} />
        </Routes>
      </Router>
    </NerdModeProvider>
  );
};

export default App;
