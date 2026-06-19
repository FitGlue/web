import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/library/layout';
import { useUser } from '../hooks/useUser';
import { useAdminStats } from '../hooks/admin';
import { adminActiveTabAtom, AdminTabId, pipelineRunFiltersAtom } from '../state/adminState';
import {
  AdminUsersConsole,
  AdminRunsConsole,
  AdminBilling,
  AdminAuditLog,
  AdminErrorBoundary,
} from '../components/admin';
import '../components/admin/admin.css';

const VIEWS: { id: AdminTabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'pipeline-runs', label: 'Runs' },
  { id: 'billing', label: 'Billing' },
  { id: 'audit', label: 'Audit' },
];

/**
 * AdminPage — dense ops console shell. Thin header with live platform metrics, a
 * compact view switcher, and a split-pane console per view.
 */
const AdminPage: React.FC = () => {
  const { user: currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useAtom(adminActiveTabAtom);
  const setRunFilters = useSetAtom(pipelineRunFiltersAtom);
  const [searchParams] = useSearchParams();
  const { stats } = useAdminStats();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab as AdminTabId);
    const userId = searchParams.get('userId');
    if (userId) setRunFilters((f) => ({ ...f, userId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!loading && !currentUser?.isAdmin) {
    return (
      <PageLayout fullWidth>
        <div className="adm__placeholder">You do not have permission to view this page.</div>
      </PageLayout>
    );
  }

  const failed = stats?.recentExecutions?.failed ?? 0;
  const showFailedRuns = () => {
    setRunFilters((f) => ({ ...f, status: 'PIPELINE_RUN_STATUS_FAILED' }));
    setActiveTab('pipeline-runs');
  };

  return (
    <PageLayout fullWidth>
      <div className="adm">
        <div className="adm__bar">
          <span className="adm__title">admin</span>
          <div className="adm__metrics">
            <span className="adm__metric"><b>{stats?.totalUsers ?? '—'}</b> users</span>
            <span className="adm__metric"><b>{stats?.athleteUsers ?? '—'}</b> athlete</span>
            <span className="adm__metric"><b>{stats?.adminUsers ?? '—'}</b> admin</span>
            <span className="adm__metric"><b>{stats?.totalSyncsThisMonth ?? '—'}</b> sync/mo</span>
            <span className="adm__metric"><b>{stats?.recentExecutions?.success ?? '—'}</b> ok/24h</span>
            <span
              className={`adm__metric adm__metric--clickable${failed > 0 ? ' adm__metric--err' : ''}`}
              role="button"
              tabIndex={0}
              onClick={showFailedRuns}
              onKeyDown={(e) => { if (e.key === 'Enter') showFailedRuns(); }}
            >
              <b>{failed}</b> err/24h
            </span>
          </div>
        </div>

        <nav className="adm__nav">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`adm__navitem${activeTab === v.id ? ' adm__navitem--active' : ''}`}
              onClick={() => setActiveTab(v.id)}
            >
              {v.label}
            </button>
          ))}
        </nav>

        {activeTab === 'users' && <AdminErrorBoundary label="Users"><AdminUsersConsole /></AdminErrorBoundary>}
        {activeTab === 'pipeline-runs' && <AdminErrorBoundary label="Runs"><AdminRunsConsole /></AdminErrorBoundary>}
        {activeTab === 'billing' && <AdminErrorBoundary label="Billing"><AdminBilling /></AdminErrorBoundary>}
        {activeTab === 'audit' && <AdminErrorBoundary label="Audit"><AdminAuditLog /></AdminErrorBoundary>}
      </div>
    </PageLayout>
  );
};

export default AdminPage;
