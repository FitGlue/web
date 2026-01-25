import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { userAtom } from '../state/authState';
import { useNerdMode } from '../state/NerdModeContext';
import { initFirebase } from '../../shared/firebase';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST, HOBBYIST_TIER_LIMITS } from '../utils/tier';
import { Input } from '../components/forms';
import './AccountSettingsPage.css';

// Profile Avatar Component
const ProfileAvatar: React.FC<{ name?: string; email?: string }> = ({
    name,
    email,
}) => {
    const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?';

    return (
        <div className="profile-avatar">
            {initial}
        </div>
    );
};

const AccountSettingsPage: React.FC = () => {
    const [firebaseUser] = useAtom(userAtom);
    const { user: profile } = useUser(); // Backend user profile with tier, etc.
    const api = useApi();
    const { isNerdMode } = useNerdMode();

    // Profile editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [savingName, setSavingName] = useState(false);

    // Email change state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [emailError, setEmailError] = useState('');

    // Delete account state
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Copy to clipboard state
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (firebaseUser?.displayName) {
            setEditedName(firebaseUser.displayName);
        }
    }, [firebaseUser?.displayName]);

    const handleSaveName = async () => {
        if (!firebaseUser || !editedName.trim()) return;

        setSavingName(true);
        try {
            await updateProfile(firebaseUser, { displayName: editedName.trim() });
            // Force reload of auth state
            await firebaseUser.reload();
            setIsEditingName(false);
        } catch (err) {
            console.error('Failed to update name:', err);
        } finally {
            setSavingName(false);
        }
    };

    const handleEmailChange = async () => {
        if (!firebaseUser || !newEmail.trim()) return;

        setEmailChangeStatus('sending');
        setEmailError('');

        try {
            const fb = await initFirebase();
            if (!fb) throw new Error('Firebase not initialized');

            // This sends a verification email to the new address
            await verifyBeforeUpdateEmail(firebaseUser, newEmail.trim());
            setEmailChangeStatus('sent');
        } catch (err: unknown) {
            console.error('Failed to send email change verification:', err);
            setEmailError(err instanceof Error ? err.message : 'Failed to send verification email');
            setEmailChangeStatus('error');
        }
    };

    const handleCopyUserId = async () => {
        if (!firebaseUser?.uid) return;
        try {
            await navigator.clipboard.writeText(firebaseUser.uid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setDeleteError('Please type DELETE to confirm');
            return;
        }

        setDeleting(true);
        setDeleteError(null);

        try {
            await api.delete('/users/me');
            window.location.href = '/auth/logout';
        } catch (err) {
            console.error('Failed to delete account:', err);
            setDeleteError('Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    // Calculate connection count
    const connectionCount = [
        profile?.integrations?.strava?.connected,
        profile?.integrations?.fitbit?.connected,
        profile?.integrations?.hevy?.connected
    ].filter(Boolean).length;

    const effectiveTier = profile ? getEffectiveTier(profile) : TIER_HOBBYIST;
    const isAthlete = effectiveTier === TIER_ATHLETE;
    const maxConnections = isAthlete ? '∞' : String(HOBBYIST_TIER_LIMITS.MAX_CONNECTIONS);
    const maxSyncs = isAthlete ? '∞' : String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH);

    return (
        <PageLayout
            title="Account Settings"
            backTo="/"
            backLabel="Dashboard"
        >
            <div className="account-settings">
                {/* Profile Section */}
                <Card className="account-info-card">
                    <h3>Profile</h3>
                    <div className="profile-section">
                        <ProfileAvatar
                            name={firebaseUser?.displayName || undefined}
                            email={firebaseUser?.email || undefined}
                        />
                        <div className="profile-details">
                            {/* Display Name */}
                            <div className="account-field">
                                <span className="field-label">Name</span>
                                {isEditingName ? (
                                    <div className="name-edit-row">
                                        <Input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            autoFocus
                                        />
                                        <Button
                                            variant="primary"
                                            size="small"
                                            onClick={handleSaveName}
                                            disabled={savingName || !editedName.trim()}
                                        >
                                            {savingName ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => {
                                                setIsEditingName(false);
                                                setEditedName(firebaseUser?.displayName || '');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="field-value-row">
                                        <span className="field-value">
                                            {firebaseUser?.displayName || <em className="text-muted">Not set</em>}
                                        </span>
                                        <Button variant="text" size="small" onClick={() => setIsEditingName(true)}>
                                            ✏️
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="account-field">
                                <span className="field-label">Email</span>
                                <div className="field-value-row">
                                    <span className="field-value">{firebaseUser?.email || 'N/A'}</span>
                                    <Button variant="text" size="small" onClick={() => setShowEmailModal(true)}>
                                        Change
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Subscription Section */}
                <Card className="account-info-card">
                    <h3>Subscription</h3>
                    <div className="account-details">
                        <div className="account-field">
                            <span className="field-label">Plan</span>
                            <div className="plan-row">
                                <span className={`tier-badge tier-badge--${effectiveTier}`}>
                                    {effectiveTier === TIER_ATHLETE ? 'Athlete' : 'Hobbyist'}
                                </span>
                                <Button variant="text" size="small" onClick={() => window.location.href = '/app/settings/upgrade'}>
                                    {effectiveTier === TIER_ATHLETE ? 'Manage →' : 'Upgrade →'}
                                </Button>
                            </div>
                        </div>
                        <div className="account-field account-field--spaced">
                            <span className="field-label">Syncs</span>
                            <span className="field-value">
                                {profile?.syncCountThisMonth ?? 0} / {maxSyncs} this month
                            </span>
                        </div>
                        <div className="account-field">
                            <span className="field-label">Connections</span>
                            <span className="field-value">
                                {connectionCount} / {maxConnections}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Help & Support Section */}
                <Card className="account-info-card">
                    <h3>Help & Support</h3>
                    <div className="help-links">
                        <a href="/help" className="help-link">
                            <span>📚</span>
                            <span>FAQ & Guides</span>
                        </a>
                        <a href="mailto:support@fitglue.tech" className="help-link">
                            <span>📧</span>
                            <span>Contact Support</span>
                        </a>
                        <a href="/feedback" className="help-link">
                            <span>💡</span>
                            <span>Request a Feature</span>
                        </a>
                    </div>
                </Card>

                {/* Advanced Section - Only visible in Nerd Mode */}
                {isNerdMode && (
                    <Card className="account-info-card">
                        <h3>🤓 Advanced</h3>
                        <div className="account-details">
                            <div className="account-field">
                                <span className="field-label">User ID</span>
                                <div className="field-value-row">
                                    <code className="user-id-code">
                                        {firebaseUser?.uid || 'N/A'}
                                    </code>
                                    <Button variant="text" size="small" onClick={handleCopyUserId}>
                                        {copied ? '✓ Copied' : '📋 Copy'}
                                    </Button>
                                </div>
                            </div>
                            <div className="account-field account-field--separator">
                                <span className="field-label">Data Rights</span>
                                <div className="data-rights-text">
                                    <p>
                                        Under GDPR you have the right to access, rectify, and delete your personal data.
                                    </p>
                                    <p>
                                        <a href="mailto:privacy@fitglue.tech" className="accent-link">
                                            Request data export (Subject Access Request)
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

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
                                <strong>Right to Erasure (GDPR Article 17)</strong><br />
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
                                {deleteError && <p className="error-message">{deleteError}</p>}
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

            {/* Email Change Modal */}
            {showEmailModal && (
                <div className="modal-overlay" onClick={() => {
                    if (emailChangeStatus !== 'sending') {
                        setShowEmailModal(false);
                        setEmailChangeStatus('idle');
                        setNewEmail('');
                        setEmailError('');
                    }
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Change Email Address</h3>

                        {emailChangeStatus === 'sent' ? (
                            <div className="email-sent-success">
                                <p className="email-sent-icon">✉️</p>
                                <p>Verification email sent to <strong>{newEmail}</strong></p>
                                <p className="text-muted text-sm">
                                    Click the link in the email to confirm your new address.
                                </p>
                                <Button variant="primary" onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailChangeStatus('idle');
                                    setNewEmail('');
                                }}>
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <>
                                <p className="email-current">
                                    Current: <strong>{firebaseUser?.email}</strong>
                                </p>
                                <div className="email-field">
                                    <label htmlFor="new-email">
                                        New Email Address
                                    </label>
                                    <Input
                                        id="new-email"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new@email.com"
                                        disabled={emailChangeStatus === 'sending'}
                                    />
                                </div>
                                {emailError && (
                                    <p className="error-message">{emailError}</p>
                                )}
                                <div className="modal-actions">
                                    <Button
                                        variant="text"
                                        onClick={() => {
                                            setShowEmailModal(false);
                                            setEmailChangeStatus('idle');
                                            setNewEmail('');
                                            setEmailError('');
                                        }}
                                        disabled={emailChangeStatus === 'sending'}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleEmailChange}
                                        disabled={emailChangeStatus === 'sending' || !newEmail.trim()}
                                    >
                                        {emailChangeStatus === 'sending' ? 'Sending...' : 'Send Verification'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default AccountSettingsPage;
