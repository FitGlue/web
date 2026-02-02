import React from 'react';
import { useAtom } from 'jotai';
import { PageLayout, Container } from '../components/library/layout';
import { TabbedCard } from '../components/library/ui';
import { useUser } from '../hooks/useUser';
import { adminActiveTabAtom, AdminTabId } from '../state/adminState';

// Admin tab components
import {
  AdminOverview,
  AdminUsers,
  AdminPipelineRuns,
  AdminExecutions,
  AdminBilling,
  UserDetailModal,
  ExecutionDetailModal,
  PipelineRunDetailModal,
} from '../components/admin';

/**
 * AdminPage - Platform administration dashboard
 * 
 * Features:
 * - Overview: Platform-wide statistics
 * - Users: User management with filtering
 * - Pipeline Runs: Cross-user pipeline execution monitoring
 * - Executions: Raw execution logs
 * - Billing: Stripe billing information
 */
const AdminPage: React.FC = () => {
  const { user: currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useAtom(adminActiveTabAtom);

  // Access check (AdminRoute wrapper should handle this, but double-check)
  if (!loading && !currentUser?.isAdmin) {
    return (
      <PageLayout title="Admin Access Denied">
        <Container>
          <p style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            You do not have permission to view this page.
          </p>
        </Container>
      </PageLayout>
    );
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'pipeline-runs', icon: '🔄', label: 'Pipeline Runs' },
    { id: 'executions', icon: '📝', label: 'Executions' },
    { id: 'billing', icon: '💳', label: 'Billing' },
  ];

  return (
    <PageLayout title="Admin Console">
      <Container>
        <TabbedCard
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as AdminTabId)}
        >
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'pipeline-runs' && <AdminPipelineRuns />}
          {activeTab === 'executions' && <AdminExecutions />}
          {activeTab === 'billing' && <AdminBilling />}
        </TabbedCard>
      </Container>

      {/* Modals */}
      <UserDetailModal />
      <ExecutionDetailModal />
      <PipelineRunDetailModal />
    </PageLayout>
  );
};

export default AdminPage;
