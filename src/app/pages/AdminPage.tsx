import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/LoadingState';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import './AdminPage.css';

interface AdminUser {
    userId: string;
    createdAt: string;
    tier: 'free' | 'pro';
    trialEndsAt?: string;
    isAdmin: boolean;
    syncCountThisMonth: number;
    stripeCustomerId?: string;
}

const AdminPage: React.FC = () => {
    const api = useApi();
    const { user: currentUser } = useUser();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/admin/users') as AdminUser[];
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch admin users:', err);
            setError('Failed to load user list. Admin access required.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (currentUser?.isAdmin) {
            fetchUsers();
        }
    }, [currentUser, fetchUsers]);

    const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
        setUpdating(userId);
        try {
            await api.patch(`/admin/users/${userId}`, updates);
            setUsers(prev => prev.map(u => u.userId === userId ? { ...u, ...updates } : u));
        } catch (err) {
            console.error('Failed to update user:', err);
            alert('Failed to update user');
        } finally {
            setUpdating(null);
        }
    };

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

    if (loading && users.length === 0) {
        return (
            <PageLayout title="Admin Dashboard">
                <LoadingState />
            </PageLayout>
        );
    }

    const proCount = users.filter(u => u.tier === 'pro').length;
    const adminCount = users.filter(u => u.isAdmin).length;

    return (
        <PageLayout
            title="Admin Console"
            onRefresh={fetchUsers}
            loading={loading}
        >
            <div className="admin-container">
                {error && <div className="billing-status error">{error}</div>}

                <div className="admin-stats">
                    <Card className="stat-card-mini">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value-mini">{users.length}</div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-label">Pro Users</div>
                        <div className="stat-value-mini">{proCount}</div>
                    </Card>
                    <Card className="stat-card-mini">
                        <div className="stat-label">Admins</div>
                        <div className="stat-value-mini">{adminCount}</div>
                    </Card>
                </div>

                <Card className="admin-table-card">
                    <h3>User Management</h3>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Tier</th>
                                    <th>Syncs (Mo)</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.userId}>
                                        <td className="user-id-cell">
                                            <div>{user.userId}</div>
                                            {user.stripeCustomerId && <small>Stripe: {user.stripeCustomerId}</small>}
                                        </td>
                                        <td>
                                            <span className={`badge ${user.tier}`}>
                                                {user.tier}
                                            </span>
                                        </td>
                                        <td className="sync-count-cell">
                                            {user.syncCountThisMonth}
                                        </td>
                                        <td>
                                            {user.isAdmin && <span className="badge admin">Admin</span>}
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="admin-actions">
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                disabled={updating === user.userId}
                                                onClick={() => handleUpdateUser(user.userId, { tier: user.tier === 'pro' ? 'free' : 'pro' })}
                                            >
                                                Toggle Tier
                                            </Button>
                                            <Button
                                                variant="text"
                                                size="small"
                                                disabled={updating === user.userId || user.userId === currentUser.userId}
                                                onClick={() => handleUpdateUser(user.userId, { isAdmin: !user.isAdmin })}
                                            >
                                                Toggle Admin
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AdminPage;
