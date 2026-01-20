import React, { useReducer, useEffect, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import './AdminPage.css';

// Types
interface AdminUser {
  userId: string;
  createdAt: string;
  tier: 'free' | 'pro';
  trialEndsAt?: string;
  isAdmin: boolean;
  syncCountThisMonth: number;
  stripeCustomerId?: string;
  integrations: string[];
  pipelineCount: number;
}

interface PendingInputDetail {
  activityId: string;
  status: 'waiting' | 'unspecified';
  enricherProviderId?: string;
  createdAt?: string;
}

interface AdminUserDetail {
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  tier: 'free' | 'pro';
  trialEndsAt?: string;
  isAdmin: boolean;
  syncCountThisMonth: number;
  stripeCustomerId?: string;
  syncCountResetAt?: string;
  integrations: Record<string, { enabled?: boolean; lastUsedAt?: string }>;
  pipelines: { id: string; name: string; source: string; destinations: string[] }[];
  activityCount: number;
  pendingInputCount: number;
  pendingInputs?: PendingInputDetail[];
}

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  adminUsers: number;
  totalSyncsThisMonth: number;
  recentExecutions: { success: number; failed: number; started: number };
}

interface Execution {
  id: string;
  service: string;
  status: string;
  userId?: string;
  pipelineExecutionId?: string;
  timestamp: string;
  errorMessage?: string;
  triggerType?: string;
}

type TabId = 'overview' | 'users' | 'executions' | 'billing';

// State shape for useReducer
interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface AdminState {
  activeTab: TabId;
  loading: boolean;
  error: string | null;
  stats: AdminStats | null;
  users: AdminUser[];
  usersPagination: Pagination | null;
  selectedUser: AdminUserDetail | null;
  userModalOpen: boolean;
  updating: string | null;
  executions: Execution[];
  selectedExecution: Execution | null;
  execModalOpen: boolean;
  availableServices: string[];
  execFilters: { service: string; status: string; userId: string; limit: string };
  userFilters: { tier: string; userId: string };
}

type AdminAction =
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_STATS'; stats: AdminStats }
  | { type: 'SET_USERS'; users: AdminUser[]; pagination?: Pagination }
  | { type: 'SET_SELECTED_USER'; user: AdminUserDetail | null; modalOpen?: boolean }
  | { type: 'SET_USER_MODAL_OPEN'; open: boolean }
  | { type: 'SET_UPDATING'; userId: string | null }
  | { type: 'SET_EXECUTIONS'; executions: Execution[]; services?: string[] }
  | { type: 'SET_SELECTED_EXECUTION'; execution: Execution | null; modalOpen?: boolean }
  | { type: 'SET_EXEC_FILTERS'; filters: Partial<AdminState['execFilters']> }
  | { type: 'SET_USER_FILTERS'; filters: Partial<AdminState['userFilters']> };

const initialState: AdminState = {
  activeTab: 'overview',
  loading: false,
  error: null,
  stats: null,
  users: [],
  usersPagination: null,
  selectedUser: null,
  userModalOpen: false,
  updating: null,
  executions: [],
  selectedExecution: null,
  execModalOpen: false,
  availableServices: [],
  execFilters: { service: '', status: '', userId: '', limit: '50' },
  userFilters: { tier: '', userId: '' },
};

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    case 'SET_USERS':
      return { ...state, users: action.users, usersPagination: action.pagination ?? state.usersPagination };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.user, userModalOpen: action.modalOpen ?? state.userModalOpen };
    case 'SET_USER_MODAL_OPEN':
      return { ...state, userModalOpen: action.open };
    case 'SET_UPDATING':
      return { ...state, updating: action.userId };
    case 'SET_EXECUTIONS':
      return { ...state, executions: action.executions, availableServices: action.services ?? state.availableServices };
    case 'SET_SELECTED_EXECUTION':
      return { ...state, selectedExecution: action.execution, execModalOpen: action.modalOpen ?? state.execModalOpen };
    case 'SET_EXEC_FILTERS':
      return { ...state, execFilters: { ...state.execFilters, ...action.filters } };
    case 'SET_USER_FILTERS':
      return { ...state, userFilters: { ...state.userFilters, ...action.filters } };
    default:
      return state;
  }
}

const AdminPage: React.FC = () => {
  const api = useApi();
  const { user: currentUser } = useUser();
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const { activeTab, loading, error, stats, users, usersPagination, selectedUser, userModalOpen, updating, executions, selectedExecution, execModalOpen, availableServices, execFilters, userFilters } = state;

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/admin/stats') as AdminStats;
      dispatch({ type: 'SET_STATS', stats: data });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [api]);

  // Fetch users with pagination
  const fetchUsers = useCallback(async (page = 1) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });
    try {
      const data = await api.get(`/admin/users?page=${page}&limit=25`) as { data: AdminUser[]; pagination: Pagination };
      dispatch({ type: 'SET_USERS', users: data.data, pagination: data.pagination });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load users. Admin access required.' });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [api]);

  // Fetch executions
  const fetchExecutions = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const params = new URLSearchParams();
      if (execFilters.service) params.set('service', execFilters.service);
      if (execFilters.status) params.set('status', execFilters.status);
      if (execFilters.userId) params.set('userId', execFilters.userId);
      params.set('limit', execFilters.limit);

      const data = await api.get(`/admin/executions?${params.toString()}`) as { executions: Execution[]; availableServices: string[] };
      dispatch({ type: 'SET_EXECUTIONS', executions: data.executions, services: data.availableServices || [] });
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [api, execFilters]);

  // Fetch user details
  const fetchUserDetail = async (userId: string) => {
    try {
      const data = await api.get(`/admin/users/${userId}`) as AdminUserDetail;
      dispatch({ type: 'SET_SELECTED_USER', user: data, modalOpen: true });
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  // Update user
  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser | { trialEndsAt: string | null; syncCountThisMonth: number }>) => {
    dispatch({ type: 'SET_UPDATING', userId });
    try {
      await api.patch(`/admin/users/${userId}`, updates);
      await fetchUsers(usersPagination?.page || 1);
      if (selectedUser?.userId === userId) {
        await fetchUserDetail(userId);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      alert('Failed to update user');
    } finally {
      dispatch({ type: 'SET_UPDATING', userId: null });
    }
  };

  // Delete user data
  const handleDeleteUserData = async (userId: string, dataType: 'integrations' | 'pipelines' | 'activities' | 'pending-inputs', subId?: string) => {
    const confirmMsg = dataType === 'activities' || dataType === 'pending-inputs'
      ? `Are you sure you want to delete all ${dataType.replace('-', ' ')} for this user?`
      : `Are you sure you want to delete this ${dataType.slice(0, -1)}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const path = subId
        ? `/admin/users/${userId}/${dataType}/${subId}`
        : `/admin/users/${userId}/${dataType}`;

      // Note: X-Confirm-Delete header is handled by backend requiring it
      await api.delete(path);
      await fetchUserDetail(userId);
    } catch (err) {
      console.error(`Failed to delete ${dataType}:`, err);
      alert(`Failed to delete ${dataType}`);
    }
  };

  // Initial data load based on tab
  useEffect(() => {
    if (currentUser?.isAdmin) {
      if (activeTab === 'overview') fetchStats();
      if (activeTab === 'users') fetchUsers(1);
      if (activeTab === 'executions') fetchExecutions();
    }
  }, [activeTab, currentUser, fetchStats, fetchUsers, fetchExecutions]);

  if (!currentUser?.isAdmin) {
    return (
      <PageLayout title="Admin Access Denied">
        <Card>
          <p>You do not have permission to view this page.</p>
          <Button onClick={() => window.location.href = '/app'}>Back to Dashboard</Button>
        </Card>
      </PageLayout>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'executions', label: 'Executions' },
    { id: 'billing', label: 'Billing' },
  ];

  return (
    <PageLayout title="Admin Console" onRefresh={() => {
      if (activeTab === 'overview') fetchStats();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'executions') fetchExecutions();
    }} loading={loading}>
      <div className="admin-container">
        {error && <div className="admin-error">{error}</div>}

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TAB', tab: tab.id })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-tab-content">
            {stats ? (
              <>
                <div className="admin-stats">
                  <Card className="stat-card-mini">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value-mini">{stats.totalUsers}</div>
                  </Card>
                  <Card className="stat-card-mini">
                    <div className="stat-label">Pro Users</div>
                    <div className="stat-value-mini">{stats.proUsers}</div>
                  </Card>
                  <Card className="stat-card-mini">
                    <div className="stat-label">Admins</div>
                    <div className="stat-value-mini">{stats.adminUsers}</div>
                  </Card>
                  <Card className="stat-card-mini">
                    <div className="stat-label">Syncs (Month)</div>
                    <div className="stat-value-mini">{stats.totalSyncsThisMonth}</div>
                  </Card>
                </div>
                <Card className="admin-section">
                  <h3>Recent Executions</h3>
                  <div className="exec-status-grid">
                    <div className="exec-status success">
                      <span className="exec-count">{stats.recentExecutions.success}</span>
                      <span className="exec-label">Success</span>
                    </div>
                    <div className="exec-status failed">
                      <span className="exec-count">{stats.recentExecutions.failed}</span>
                      <span className="exec-label">Failed</span>
                    </div>
                    <div className="exec-status started">
                      <span className="exec-count">{stats.recentExecutions.started}</span>
                      <span className="exec-label">Started</span>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <LoadingState />
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-tab-content">
            <Card className="admin-section">
              <h3>Filters</h3>
              <div className="exec-filters">
                <select
                  value={userFilters.tier}
                  onChange={e => dispatch({ type: 'SET_USER_FILTERS', filters: { tier: e.target.value } })}
                >
                  <option value="">All Tiers</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter by User ID..."
                  value={userFilters.userId}
                  onChange={e => dispatch({ type: 'SET_USER_FILTERS', filters: { userId: e.target.value } })}
                />
                <Button size="small" onClick={() => fetchUsers(1)}>Apply</Button>
              </div>
            </Card>
            <Card className="admin-table-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Tier</th>
                      <th>Syncs</th>
                      <th>Integrations</th>
                      <th>Pipelines</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.userId} onClick={() => fetchUserDetail(user.userId)} style={{ cursor: 'pointer' }}>
                        <td className="user-id-cell">
                          <div>{user.userId.slice(0, 8)}...</div>
                          {user.isAdmin && <span className="badge admin">Admin</span>}
                        </td>
                        <td>
                          <span className={`badge ${user.tier}`}>{user.tier}</span>
                        </td>
                        <td>{user.syncCountThisMonth}</td>
                        <td>{user.integrations.length > 0 ? user.integrations.join(', ') : '-'}</td>
                        <td>{user.pipelineCount}</td>
                        <td className="admin-actions" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="secondary"
                            size="small"
                            disabled={updating === user.userId}
                            onClick={() => handleUpdateUser(user.userId, { tier: user.tier === 'pro' ? 'free' : 'pro' })}
                          >
                            {user.tier === 'pro' ? '↓ Free' : '↑ Pro'}
                          </Button>
                          <Button
                            variant="text"
                            size="small"
                            disabled={updating === user.userId || user.userId === currentUser.userId}
                            onClick={() => handleUpdateUser(user.userId, { isAdmin: !user.isAdmin })}
                          >
                            {user.isAdmin ? '✕ Admin' : '✓ Admin'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            {/* Pagination Controls */}
            {usersPagination && (
              <div className="pagination-controls">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={usersPagination.page <= 1 || loading}
                  onClick={() => fetchUsers(usersPagination.page - 1)}
                >
                  ← Previous
                </Button>
                <span className="pagination-info">
                  Page {usersPagination.page} of {Math.ceil(usersPagination.total / usersPagination.limit)} ({usersPagination.total} total)
                </span>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={!usersPagination.hasMore || loading}
                  onClick={() => fetchUsers(usersPagination.page + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div className="admin-tab-content">
            <Card className="admin-section">
              <h3>Filters</h3>
              <div className="exec-filters">
                <select
                  value={execFilters.service}
                  onChange={e => dispatch({ type: 'SET_EXEC_FILTERS', filters: { service: e.target.value } })}
                >
                  <option value="">All Services</option>
                  {availableServices.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={execFilters.status}
                  onChange={e => dispatch({ type: 'SET_EXEC_FILTERS', filters: { status: e.target.value } })}
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="STARTED">Started</option>
                </select>
                <input
                  type="text"
                  placeholder="User ID..."
                  value={execFilters.userId}
                  onChange={e => dispatch({ type: 'SET_EXEC_FILTERS', filters: { userId: e.target.value } })}
                />
                <select
                  value={execFilters.limit}
                  onChange={e => dispatch({ type: 'SET_EXEC_FILTERS', filters: { limit: e.target.value } })}
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <Button variant="secondary" size="small" onClick={fetchExecutions}>Apply</Button>
              </div>
            </Card>
            <Card className="admin-table-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>User</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.map(exec => (
                      <tr key={exec.id} onClick={() => dispatch({ type: 'SET_SELECTED_EXECUTION', execution: exec, modalOpen: true })} style={{ cursor: 'pointer' }}>
                        <td style={{ fontSize: '0.8rem' }}>{exec.timestamp ? new Date(exec.timestamp).toLocaleString() : '-'}</td>
                        <td>{exec.service}</td>
                        <td><span className={`badge ${exec.status.toLowerCase()}`}>{exec.status}</span></td>
                        <td className="user-id-cell">{exec.userId?.slice(0, 8) || '-'}</td>
                        <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {exec.errorMessage || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="admin-tab-content">
            <Card className="admin-section">
              <h3>Pro Users with Stripe</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Stripe Customer</th>
                      <th>Trial Ends</th>
                      <th>Syncs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.tier === 'pro' || u.stripeCustomerId).map(user => (
                      <tr key={user.userId}>
                        <td className="user-id-cell">{user.userId.slice(0, 8)}...</td>
                        <td>
                          {user.stripeCustomerId ? (
                            <a
                              href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="stripe-link"
                            >
                              {user.stripeCustomerId.slice(0, 12)}...
                            </a>
                          ) : '-'}
                        </td>
                        <td>{user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : '-'}</td>
                        <td>{user.syncCountThisMonth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* User Detail Modal */}
        {userModalOpen && selectedUser && (
          <div className="admin-modal-overlay" onClick={() => dispatch({ type: 'SET_USER_MODAL_OPEN', open: false })}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>User Details</h2>
                <button className="modal-close" onClick={() => dispatch({ type: 'SET_USER_MODAL_OPEN', open: false })}>×</button>
              </div>
              <div className="admin-modal-content">
                {/* Overview */}
                <section className="modal-section">
                  <h4>Overview</h4>
                  <div className="detail-grid">
                    <div><strong>User ID:</strong> {selectedUser.userId}</div>
                    {selectedUser.email && <div><strong>Email:</strong> {selectedUser.email}</div>}
                    {selectedUser.displayName && <div><strong>Name:</strong> {selectedUser.displayName}</div>}
                    <div><strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</div>
                    <div><strong>Tier:</strong> <span className={`badge ${selectedUser.tier}`}>{selectedUser.tier}</span></div>
                    <div><strong>Admin:</strong> {selectedUser.isAdmin ? 'Yes' : 'No'}</div>
                    <div><strong>Trial Ends:</strong> {selectedUser.trialEndsAt ? new Date(selectedUser.trialEndsAt).toLocaleDateString() : '-'}</div>
                    <div><strong>Syncs:</strong> {selectedUser.syncCountThisMonth} <Button size="small" variant="text" onClick={() => handleUpdateUser(selectedUser.userId, { syncCountThisMonth: 0 })}>Reset</Button></div>
                  </div>
                  <div className="modal-actions">
                    <Button size="small" onClick={() => handleUpdateUser(selectedUser.userId, { tier: selectedUser.tier === 'pro' ? 'free' : 'pro' })}>
                      Toggle Tier
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => handleUpdateUser(selectedUser.userId, { trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })}>
                      Extend Trial 30d
                    </Button>
                  </div>
                </section>

                {/* Integrations */}
                <section className="modal-section">
                  <h4>Integrations ({Object.keys(selectedUser.integrations).length})</h4>
                  {Object.entries(selectedUser.integrations).length > 0 ? (
                    <ul className="detail-list">
                      {Object.entries(selectedUser.integrations).map(([provider]) => (
                        <li key={provider}>
                          <span>{provider}</span>
                          <Button size="small" variant="text" onClick={() => handleDeleteUserData(selectedUser.userId, 'integrations', provider)}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No integrations</p>}
                </section>

                {/* Pipelines */}
                <section className="modal-section">
                  <h4>Pipelines ({selectedUser.pipelines?.length || 0})</h4>
                  {selectedUser.pipelines?.length > 0 ? (
                    <ul className="detail-list">
                      {selectedUser.pipelines.map(p => (
                        <li key={p.id}>
                          <span><strong>{p.name}</strong>: {p.source} → [{p.destinations.join(', ')}]</span>
                          <Button size="small" variant="text" onClick={() => handleDeleteUserData(selectedUser.userId, 'pipelines', p.id)}>Remove</Button>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No pipelines</p>}
                </section>

                {/* Data Management */}
                <section className="modal-section">
                  <h4>Data Management</h4>
                  <div className="data-actions">
                    <div className="data-action">
                      <span>Synchronized Activities: {selectedUser.activityCount}</span>
                      <Button size="small" variant="text" disabled={selectedUser.activityCount === 0} onClick={() => handleDeleteUserData(selectedUser.userId, 'activities')}>
                        Delete All
                      </Button>
                    </div>
                    <div className="data-action">
                      <span>Pending Inputs: {selectedUser.pendingInputCount}</span>
                      <Button size="small" variant="text" disabled={selectedUser.pendingInputCount === 0} onClick={() => handleDeleteUserData(selectedUser.userId, 'pending-inputs')}>
                        Delete All
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Billing */}
                {selectedUser.stripeCustomerId && (
                  <section className="modal-section">
                    <h4>Billing</h4>
                    <p>
                      <strong>Stripe Customer:</strong>{' '}
                      <a href={`https://dashboard.stripe.com/customers/${selectedUser.stripeCustomerId}`} target="_blank" rel="noopener noreferrer" className="stripe-link">
                        {selectedUser.stripeCustomerId}
                      </a>
                    </p>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Execution Detail Modal */}
        {execModalOpen && selectedExecution && (
          <div className="admin-modal-overlay" onClick={() => dispatch({ type: 'SET_SELECTED_EXECUTION', execution: null, modalOpen: false })}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Execution Details</h2>
                <Button variant="text" onClick={() => dispatch({ type: 'SET_SELECTED_EXECUTION', execution: null, modalOpen: false })}>✕</Button>
              </div>
              <div className="admin-modal-content">
                <section className="modal-section">
                  <div className="detail-grid">
                    <div><strong>Execution ID:</strong> {selectedExecution.id}</div>
                    <div><strong>Service:</strong> {selectedExecution.service}</div>
                    <div><strong>Status:</strong> <span className={`badge ${selectedExecution.status.toLowerCase()}`}>{selectedExecution.status}</span></div>
                    <div><strong>Timestamp:</strong> {selectedExecution.timestamp ? new Date(selectedExecution.timestamp).toLocaleString() : '-'}</div>
                    {selectedExecution.userId && <div><strong>User ID:</strong> {selectedExecution.userId}</div>}
                    {selectedExecution.pipelineExecutionId && <div><strong>Pipeline Execution:</strong> {selectedExecution.pipelineExecutionId}</div>}
                    {selectedExecution.triggerType && <div><strong>Trigger:</strong> {selectedExecution.triggerType}</div>}
                  </div>
                  {selectedExecution.errorMessage && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Error:</strong>
                      <pre style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,0,0,0.1)', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.85rem' }}>
                        {selectedExecution.errorMessage}
                      </pre>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminPage;
