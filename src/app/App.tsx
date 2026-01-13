import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';

// Auth pages (public)
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  LogoutPage,
  VerifyEmailPage
} from './pages/auth';

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
import { useFCM } from './hooks/useFCM';
import { NerdModeProvider } from './state/NerdModeContext';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects authenticated users to app)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  // Allow logout and verify-email for authenticated users
  const path = window.location.pathname;
  if (user && !path.includes('logout') && !path.includes('verify-email')) {
    return <Navigate to="/" replace />;
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
          {/* Public auth routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

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
        </Routes>
      </Router>
    </NerdModeProvider>
  );
};

export default App;
