import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAtom } from 'jotai';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase } from '../shared/firebase';
import { userAtom, authLoadingAtom } from './state/authState';
import { initSentry, setUser as setSentryUser, Sentry } from './infrastructure/sentry';
import { Stack } from './components/library/layout';
import { Card, Heading, Paragraph, Button, Code, ToastProvider, AppLoadingScreen } from './components/library/ui';
import { Link } from './components/library/navigation';

// App pages (protected)
import DashboardPage from './pages/DashboardPage';
import PendingInputsPage from './pages/PendingInputsPage';
import ActivitiesListPage from './pages/ActivitiesListPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import UnsynchronizedDetailPage from './pages/UnsynchronizedDetailPage';
import ConnectionsPage from './pages/ConnectionsPage';
import ConnectionSetupPage from './pages/ConnectionSetupPage';
import ConnectionSuccessPage from './pages/ConnectionSuccessPage';
import ConnectionErrorPage from './pages/ConnectionErrorPage';
import ConnectionDetailPage from './pages/ConnectionDetailPage';
import PipelinesPage from './pages/PipelinesPage';
import PipelineWizardPage from './pages/PipelineWizardPage';
import PipelineEditPage from './pages/PipelineEditPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import EnricherDataPage from './pages/EnricherDataPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPage from './pages/AdminPage';
import ShowcaseManagementPage from './pages/ShowcaseManagementPage';
import RecipesPage from './pages/RecipesPage';
import NotFoundPage from './pages/NotFoundPage';


import { useFCM } from './hooks/useFCM';
import { useUser } from './hooks/useUser';
import { NerdModeProvider } from './state/NerdModeContext';

// Initialize Sentry before app renders
initSentry();

// Protected route wrapper - redirects to static /auth/login page
// Also enforces waitlist by checking accessEnabled from user profile
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser] = useAtom(userAtom);
  const [authLoading] = useAtom(authLoadingAtom);
  const { user: profile, loading: profileLoading } = useUser();

  // Show loading while Firebase auth or profile is loading
  if (authLoading || profileLoading) {
    return <AppLoadingScreen />;
  }

  // Not authenticated - redirect to login
  if (!firebaseUser) {
    window.location.href = '/auth/login';
    return (
      <Card>
        <Paragraph>Redirecting to login...</Paragraph>
      </Card>
    );
  }

  // Authenticated but waitlisted (no access enabled) - redirect to access-pending
  // Admins always have access regardless of accessEnabled flag
  if (profile && !profile.accessEnabled && !profile.isAdmin) {
    window.location.href = '/auth/access-pending';
    return (
      <Card>
        <Paragraph>Redirecting...</Paragraph>
      </Card>
    );
  }

  return <>{children}</>;
};

// Admin route wrapper - ensures user has admin role
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();

  // useUser now properly includes auth loading, so this handles the full loading story
  if (loading) {
    return (
      <Card>
        <Stack gap="md" align="center">
          <Heading level={3}>Loading Admin Console</Heading>
          <Paragraph>Verifying admin permissions...</Paragraph>
        </Stack>
      </Card>
    );
  }

  if (!user?.isAdmin) {
    return (
      <Card>
        <Stack gap="md" align="center">
          <Heading level={2}>Access Denied</Heading>
          <Paragraph>You do not have admin privileges to view this page.</Paragraph>
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
      <ToastProvider>
        <NerdModeProvider>
          <Router basename="/app">
            <Routes>
              {/* Protected app routes */}
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/inputs" element={<ProtectedRoute><PendingInputsPage /></ProtectedRoute>} />
              <Route path="/activities" element={<ProtectedRoute><ActivitiesListPage /></ProtectedRoute>} />
              <Route path="/activities/unsynchronized/:pipelineExecutionId" element={<ProtectedRoute><UnsynchronizedDetailPage /></ProtectedRoute>} />
              <Route path="/activities/:id" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />
              <Route path="/settings/integrations" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
              <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
              <Route path="/connections/:id/setup" element={<ProtectedRoute><ConnectionSetupPage /></ProtectedRoute>} />
              <Route path="/connections/:id/success" element={<ProtectedRoute><ConnectionSuccessPage /></ProtectedRoute>} />
              <Route path="/connections/:id/error" element={<ProtectedRoute><ConnectionErrorPage /></ProtectedRoute>} />
              <Route path="/connections/:id" element={<ProtectedRoute><ConnectionDetailPage /></ProtectedRoute>} />
              <Route path="/settings/pipelines" element={<ProtectedRoute><PipelinesPage /></ProtectedRoute>} />
              <Route path="/settings/pipelines/new" element={<ProtectedRoute><PipelineWizardPage /></ProtectedRoute>} />
              <Route path="/settings/pipelines/:pipelineId/edit" element={<ProtectedRoute><PipelineEditPage /></ProtectedRoute>} />
              <Route path="/settings/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/enricher-data" element={<ProtectedRoute><EnricherDataPage /></ProtectedRoute>} />
              <Route path="/settings/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/settings/showcase" element={<ProtectedRoute><ShowcaseManagementPage /></ProtectedRoute>} />
              <Route path="/settings/upgrade" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
              <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />




              {/* Catch-all for unknown routes */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </NerdModeProvider>
      </ToastProvider>
    </Sentry.ErrorBoundary>
  );
};

export default App;
