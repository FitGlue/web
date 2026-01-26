import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';
import { initSentry, setUser as setSentryUser, Sentry } from './infrastructure/sentry';
import { Stack } from './components/library/layout';
import { Card, Heading, Paragraph, Button, Code } from './components/library/ui';
import { Link } from './components/library/navigation';

// App pages (protected)
import DashboardPage from './pages/DashboardPage';
import PendingInputsPage from './pages/PendingInputsPage';
import ActivitiesListPage from './pages/ActivitiesListPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import UnsynchronizedDetailPage from './pages/UnsynchronizedDetailPage';
import SettingsPage from './pages/SettingsPage';
import ConnectionsPage from './pages/ConnectionsPage';
import ConnectionSetupPage from './pages/ConnectionSetupPage';
import ConnectionSuccessPage from './pages/ConnectionSuccessPage';
import ConnectionErrorPage from './pages/ConnectionErrorPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineWizardPage from './pages/PipelineWizardPage';
import PipelineEditPage from './pages/PipelineEditPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';


import { useFCM } from './hooks/useFCM';
import { useUser } from './hooks/useUser';
import { NerdModeProvider } from './state/NerdModeContext';

// Initialize Sentry before app renders
initSentry();

// Protected route wrapper - redirects to static /auth/login page
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useAtom(userAtom);
  const [loading] = useAtom(authLoadingAtom);

  if (loading) {
    return (
      <Card>
        <Paragraph>Loading...</Paragraph>
      </Card>
    );
  }

  if (!user) {
    // Redirect to static auth page (outside React app)
    window.location.href = '/auth/login';
    return (
      <Card>
        <Paragraph>Redirecting to login...</Paragraph>
      </Card>
    );
  }

  return <>{children}</>;
};

// Admin route wrapper - ensures user has admin role
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <Card>
        <Paragraph>Loading admin console...</Paragraph>
      </Card>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Card>
        <Stack gap="md" align="center">
          <Heading level={2}>Access Denied</Heading>
          <Paragraph>You do not have permission to view this page.</Paragraph>
          <Link to="/app">← Back to Dashboard</Link>
        </Stack>
      </Card>
    );
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

        // Update Sentry user context
        setSentryUser(u?.uid || null);
      });
    };

    setup();
  }, [setUser, setLoading]);

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <Card>
          <Stack gap="md" align="center">
            <Heading level={2}>Something went wrong</Heading>
            <Paragraph>We&apos;ve been notified and are working on a fix.</Paragraph>
            <Code>
              {error instanceof Error ? error.message : String(error)}
            </Code>
            <Button onClick={resetError} variant="primary">
              Try Again
            </Button>
          </Stack>
        </Card>
      )}
    >
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
            <Route path="/settings/integrations" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
            <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
            <Route path="/connections/:id/setup" element={<ProtectedRoute><ConnectionSetupPage /></ProtectedRoute>} />
            <Route path="/connections/:id/success" element={<ProtectedRoute><ConnectionSuccessPage /></ProtectedRoute>} />
            <Route path="/connections/:id/error" element={<ProtectedRoute><ConnectionErrorPage /></ProtectedRoute>} />
            <Route path="/settings/pipelines" element={<ProtectedRoute><PipelinesPage /></ProtectedRoute>} />
            <Route path="/settings/pipelines/new" element={<ProtectedRoute><PipelineWizardPage /></ProtectedRoute>} />
            <Route path="/settings/pipelines/:pipelineId/edit" element={<ProtectedRoute><PipelineEditPage /></ProtectedRoute>} />
            <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
            <Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/settings/upgrade" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />




            {/* Catch-all for unknown routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NerdModeProvider>
    </Sentry.ErrorBoundary>
  );
};

export default App;
