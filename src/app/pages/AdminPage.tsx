import React from 'react';
import { useAtom } from 'jotai';
import { Container } from '../components/library/layout';
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
      <div>
        <div className="page-head">
          <div>
            <div className="page-head__eyebrow">ADMIN</div>
            <h1>Access Denied</h1>
          </div>
        </div>
        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', letterSpacing: '0.14em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            You do not have permission to view this page.
          </span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'pipeline-runs', icon: '🔄', label: 'Pipeline Runs' },
    { id: 'billing', icon: '💳', label: 'Billing' },
  ];

  return (
    <div>
      {/* Page head */}
      <div className="page-head">
        <div>
          <div className="page-head__eyebrow">PLATFORM</div>
          <h1>Admin Console</h1>
        </div>
      </div>

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
    </div>
  );
};

export default AdminPage;
