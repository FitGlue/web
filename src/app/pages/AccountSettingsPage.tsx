import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { userAtom } from '../state/authState';

const AccountSettingsPage: React.FC = () => {
    const [user] = useAtom(userAtom);
    const api = useApi();
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setError('Please type DELETE to confirm');
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            await api.delete('/users/me');
            // Redirect to logout/login after successful deletion
            window.location.href = '/auth/logout';
        } catch (err) {
            console.error('Failed to delete account:', err);
            setError('Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <PageLayout
            title="Account Settings"
            backTo="/"
            backLabel="Dashboard"
        >
            <div className="account-settings">
                {/* Account Info Section */}
                <Card className="account-info-card">
                    <h3>Account Information</h3>
                    <div className="account-details">
                        <div className="account-field">
                            <span className="field-label">Email</span>
                            <span className="field-value">{user?.email || 'N/A'}</span>
                        </div>
                        <div className="account-field">
                            <span className="field-label">User ID</span>
                            <code className="field-value">{user?.uid || 'N/A'}</code>
                        </div>
                        <div className="account-field" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span className="field-label">Subscription</span>
                            <div className="field-value" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className={`tier-badge ${user?.tier || 'free'}`} style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    background: user?.tier === 'pro' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'
                                }}>
                                    {user?.tier || 'Free'}
                                </span>
                                <Button variant="text" size="small" onClick={() => window.location.href = '/app/settings/upgrade'}>
                                    {user?.tier === 'pro' ? 'Manage' : 'Upgrade →'}
                                </Button>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="danger-zone-card">
                    <div className="danger-zone">
                        <div className="danger-header">
                            <span className="danger-icon">⚠️</span>
                            <h3>Danger Zone</h3>
                        </div>
                        <div className="danger-content">
                            <h4>Delete Account</h4>
                            <p className="danger-warning">
                                This action is <strong>permanent and irreversible</strong>.
                                Deleting your account will remove:
                            </p>
                            <ul className="danger-list">
                                <li>All your connected integrations (Strava, Fitbit, Hevy)</li>
                                <li>All configured pipelines</li>
                                <li>All synchronized and raw activities</li>
                                <li>All pending inputs</li>
                                <li>All API keys</li>
                            </ul>
                            <div className="delete-confirmation">
                                <label htmlFor="delete-confirm">
                                    Type <strong>DELETE</strong> to confirm:
                                </label>
                                <input
                                    id="delete-confirm"
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Type DELETE"
                                    className="delete-input"
                                    disabled={deleting}
                                />
                                {error && <p className="error-message">{error}</p>}
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== 'DELETE' || deleting}
                                    fullWidth
                                >
                                    {deleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AccountSettingsPage;
