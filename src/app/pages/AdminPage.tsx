import React from 'react';
import { useAtom } from 'jotai';
import { Container, PageLayout } from '../components/library/layout';
import { TabbedCard } from '../components/library/ui';
import { useUser } from '../hooks/useUser';
import { adminActiveTabAtom, AdminTabId } from '../state/adminState';

// Admin tab components
import {
  AdminOverview,
  AdminUsers,
  AdminPipelineRuns,
  AdminBilling,
  UserDetailModal,
  PipelineRunDetailModal,
} from '../components/admin';

/**
 * AdminPage - Platform administration dashboard
 *
 * Features:
 * - Overview: Platform-wide statistics
 * - Users: User management with filtering
 * - Pipeline Runs: Cross-user pipeline execution monitoring
 * - Billing: Stripe billing information
 */
const AdminPage: React.FC = () => {
  const { user: currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useAtom(adminActiveTabAtom);

  // Access check (AdminRoute wrapper should handle this, but double-check)
  if (!loading && !currentUser?.isAdmin) {
    return (
      <PageLayout title="Access Denied">
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            You do not have permission to view this page.
          </span>
        </div>
      </PageLayout>
    );
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'pipeline-runs', icon: '🔄', label: 'Pipeline Runs' },
    { id: 'billing', icon: '💳', label: 'Billing' },
  ];

  return (
    <PageLayout title="Admin Console" fullWidth>
      {/* Band */}
      <div className="fg-band">
        <span className="fg-band__label">ADMIN CONSOLE</span>
        <span className="fg-band__right">PLATFORM</span>
      </div>

      <Container size="full" centered={false}>
        <TabbedCard
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as AdminTabId)}
        >
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'pipeline-runs' && <AdminPipelineRuns />}
          {activeTab === 'billing' && <AdminBilling />}
        </TabbedCard>
      </Container>

      {/* Modals */}
      <UserDetailModal />
      <PipelineRunDetailModal />
    </PageLayout>
  );
};

export default AdminPage;
