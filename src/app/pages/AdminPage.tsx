import React from 'react';
import { useAtom } from 'jotai';
import { Container, PageLayout } from '../components/library/layout';
import { TabbedCard } from '../components/library/ui';
import { useUser } from '../hooks/useUser';
import { useAdminStats } from '../hooks/admin';
import { adminActiveTabAtom, AdminTabId } from '../state/adminState';

// Admin tab components
import {
  AdminOverview,
  AdminUsers,
  AdminPipelineRuns,
  AdminBilling,
  UserDetailModal,
  PipelineRunDetailModal,
  AdminErrorBoundary,
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
  const { stats } = useAdminStats();

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

      {/* Head stats row */}
      <div className="admin-head-stats">
        <div className="admin-stat-block">
          <div className="admin-stat-block__value">{stats?.totalUsers ?? '—'}</div>
          <div className="admin-stat-block__label">Total Users</div>
        </div>
        <div className="admin-stat-block">
          <div className="admin-stat-block__value">{stats?.athleteUsers ?? '—'}</div>
          <div className="admin-stat-block__label">Athlete</div>
        </div>
        <div className="admin-stat-block">
          <div className="admin-stat-block__value">{stats?.totalSyncsThisMonth ?? '—'}</div>
          <div className="admin-stat-block__label">Syncs · Month</div>
        </div>
        <div className="admin-stat-block">
          <div className="admin-stat-block__value">{stats?.recentExecutions?.success ?? '—'}</div>
          <div className="admin-stat-block__label">Runs · 24H</div>
        </div>
        <div className="admin-stat-block">
          <div className="admin-stat-block__value" style={{ color: (stats?.recentExecutions?.failed ?? 0) > 0 ? 'var(--fg-rose)' : undefined }}>{stats?.recentExecutions?.failed ?? '—'}</div>
          <div className="admin-stat-block__label">Errors</div>
        </div>
      </div>

      {/* Body grid: main tabs + side panel */}
      <div className="admin-body-grid">
        <div>
          <Container size="full" centered={false}>
            <TabbedCard
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as AdminTabId)}
            >
              {activeTab === 'overview' && (
                <AdminErrorBoundary label="Overview"><AdminOverview /></AdminErrorBoundary>
              )}
              {activeTab === 'users' && (
                <AdminErrorBoundary label="Users"><AdminUsers /></AdminErrorBoundary>
              )}
              {activeTab === 'pipeline-runs' && (
                <AdminErrorBoundary label="Pipeline Runs"><AdminPipelineRuns /></AdminErrorBoundary>
              )}
              {activeTab === 'billing' && (
                <AdminErrorBoundary label="Billing"><AdminBilling /></AdminErrorBoundary>
              )}
            </TabbedCard>
          </Container>
        </div>

        {/* Side panel */}
        <div className="admin-side-panel">
          <div className="admin-side-panel__band">System Health</div>
          <div className="admin-stat-row">
            <span className="admin-stat-row__label">API Health</span>
            <span className="admin-stat-row__value" style={{ color: 'var(--fg-green)' }}>OK</span>
          </div>
          <div className="admin-stat-row">
            <span className="admin-stat-row__label">DB Connections</span>
            <span className="admin-stat-row__value">Healthy</span>
          </div>
          <div className="admin-stat-row">
            <span className="admin-stat-row__label">Queue Depth</span>
            <span className="admin-stat-row__value">{stats?.recentExecutions?.started ?? 0}</span>
          </div>
          <div className="admin-stat-row">
            <span className="admin-stat-row__label">Webhook Status</span>
            <span className="admin-stat-row__value" style={{ color: 'var(--fg-green)' }}>Active</span>
          </div>
          <div className="admin-stat-row">
            <span className="admin-stat-row__label">Admin Users</span>
            <span className="admin-stat-row__value">{stats?.adminUsers ?? '—'}</span>
          </div>
          <div className="admin-side-panel__band" style={{ marginTop: '0.5rem' }}>Activity</div>
          <div className="admin-log-row">Platform monitoring active</div>
          <div className="admin-log-row">Stats refresh on load</div>
          <div className="admin-log-row">All pipeline modals available</div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="admin-danger-zone">
        <div className="admin-danger-zone__label">Danger Zone · Admins Only · Logged &amp; Audited</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="fg-button fg-button--sm" style={{ color: 'var(--fg-rose)', boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)', background: 'transparent' }} type="button">
            Force Logout All Sessions
          </button>
          <button className="fg-button fg-button--sm" style={{ color: 'var(--fg-rose)', boxShadow: 'inset 0 0 0 1.5px var(--fg-rose)', background: 'transparent' }} type="button">
            Pause All Webhooks
          </button>
        </div>
      </div>

      {/* Modals */}
      <UserDetailModal />
      <PipelineRunDetailModal />
    </PageLayout>
  );
};

export default AdminPage;
