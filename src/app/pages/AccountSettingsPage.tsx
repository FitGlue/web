import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { updateProfile } from 'firebase/auth';
import { client } from '../../shared/api/client';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { userAtom } from '../state/authState';
import { useNerdMode } from '../state/NerdModeContext';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST, HOBBYIST_TIER_LIMITS } from '../utils/tier';
import { NotificationPreferencesCard } from '../components/NotificationPreferencesCard';
import { ReauthModal } from '../components/ReauthModal';
import { useToast } from '../components/library/ui';

const AccountSettingsPage: React.FC = () => {
    const [firebaseUser] = useAtom(userAtom);
    const { user: profile } = useUser();
    const toast = useToast();
    const { isNerdMode } = useNerdMode();
    const { changePassword } = useAuth();

    // Name editing
    const [editedName, setEditedName] = useState('');
    const [savingName, setSavingName] = useState(false);

    // Email editing
    const [editedEmail, setEditedEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Reauth modal state
    const [showReauthModal, setShowReauthModal] = useState(false);

    // Data export state
    const [exportStatus, setExportStatus] = useState<'idle' | 'pending' | 'running' | 'completed' | 'failed'>('idle');
    const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);

    useEffect(() => {
        if (firebaseUser?.displayName) {
            setEditedName(firebaseUser.displayName);
        }
        if (firebaseUser?.email) {
            setEditedEmail(firebaseUser.email);
        }
    }, [firebaseUser?.displayName, firebaseUser?.email]);

    const isNameDirty = editedName.trim() !== (firebaseUser?.displayName || '');
    const isEmailDirty = editedEmail.trim() !== (firebaseUser?.email || '');

    const handleSaveName = async () => {
        if (!firebaseUser || !editedName.trim()) return;
        setSavingName(true);
        try {
            await updateProfile(firebaseUser, { displayName: editedName.trim() });
            await firebaseUser.reload();
            toast.success('Name Updated', 'Your display name has been saved');
        } catch (err) {
            console.error('Failed to update name:', err);
            toast.error('Update Failed', 'Failed to update name. Please try again.');
        } finally {
            setSavingName(false);
        }
    };

    const handleSaveEmail = async () => {
        if (!firebaseUser || !editedEmail.trim()) return;
        if (editedEmail.trim() === firebaseUser.email) return;
        setSavingEmail(true);
        setEmailError('');
        setEmailSent(false);
        try {
            await client.POST('/users/me/auth-email/send-email-change', { body: { newEmail: editedEmail.trim() } as never });
            setEmailSent(true);
            toast.info('Verification Sent', `Check ${editedEmail} for the verification link`);
        } catch (err: unknown) {
            console.error('Failed to send email change verification:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to send verification email';
            setEmailError(errorMsg);
            toast.error('Email Update Failed', errorMsg);
        } finally {
            setSavingEmail(false);
        }
    };

    const handleReauthSuccess = () => {
        setShowReauthModal(false);
        handleSaveEmail();
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!currentPassword) { setPasswordError('Current password is required'); return; }
        if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters'); return; }
        if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
        setChangingPassword(true);
        const success = await changePassword(currentPassword, newPassword);
        setChangingPassword(false);
        if (success) {
            setPasswordSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Password Changed', 'Your password has been updated');
        } else {
            setPasswordError('Failed to change password. Check your current password and try again.');
        }
    };

    const hasPasswordProvider = firebaseUser?.providerData?.some(
        (p) => p.providerId === 'password'
    ) ?? false;

    const handleCopyUserId = async () => {
        if (!firebaseUser?.uid) return;
        try {
            await navigator.clipboard.writeText(firebaseUser.uid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copied', 'User ID copied to clipboard');
        } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Copy Failed', 'Failed to copy to clipboard');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') { setDeleteError('Please type DELETE to confirm'); return; }
        setDeleting(true);
        setDeleteError(null);
        try {
            await client.DELETE('/users/me');
            window.location.href = '/auth/logout';
        } catch (err) {
            console.error('Failed to delete account:', err);
            setDeleteError('Failed to delete account. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleExportData = async () => {
        setExportStatus('pending');
        setExportError(null);
        setExportDownloadUrl(null);
        try {
            const { data: response } = await client.POST('/users/me/export');
            const typedResponse = response as { jobId: string };
            const jobId = typedResponse?.jobId;
            const pollInterval = setInterval(async () => {
                try {
                    const { data: status } = await client.GET('/export/status/{jobId}' as never, { params: { path: { jobId } } } as never);
                    const typedStatus = status as unknown as { status: string; downloadUrl?: string; error?: string };
                    if (typedStatus?.status === 'COMPLETED') {
                        clearInterval(pollInterval);
                        setExportStatus('completed');
                        setExportDownloadUrl(typedStatus.downloadUrl as string);
                        toast.success('Export Ready', 'Your data export is ready to download');
                    } else if (typedStatus?.status === 'FAILED') {
                        clearInterval(pollInterval);
                        setExportStatus('failed');
                        setExportError(typedStatus.error || 'Export failed');
                        toast.error('Export Failed', 'Your data export could not be completed');
                    } else {
                        setExportStatus('running');
                    }
                } catch {
                    clearInterval(pollInterval);
                    setExportStatus('failed');
                    setExportError('Failed to check export status');
                }
            }, 5000);
        } catch (err) {
            console.error('Failed to trigger export:', err);
            setExportStatus('failed');
            setExportError('Failed to start data export');
            toast.error('Export Failed', 'Could not start data export');
        }
    };

    const effectiveTier = profile ? getEffectiveTier(profile) : TIER_HOBBYIST;
    const isAthlete = effectiveTier === TIER_ATHLETE;
    const maxSyncs = isAthlete ? '∞' : String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH);
    const syncsUsed = profile?.syncCountThisMonth ?? 0;

    const getInitial = () => {
        if (firebaseUser?.displayName) return firebaseUser.displayName[0].toUpperCase();
        if (firebaseUser?.email) return firebaseUser.email[0].toUpperCase();
        return '?';
    };

    return (
        <div>
            {/* Page Head */}
            <div className="page-head">
                <div>
                    <div className="page-head__eyebrow">SETTINGS / ACCOUNT</div>
                    <h1>Account</h1>
                </div>
            </div>

            {/* Settings layout */}
            <div className="settings">
                {/* Rail */}
                <aside className="settings__rail">
                    <div className="settings__rail-section">PROFILE</div>
                    <a href="/app/settings/account" className="active">Account</a>
                    <a href="/app/settings/showcase">Showcase</a>

                    <div className="settings__rail-section">BILLING</div>
                    <a href="/app/settings/subscription">Subscription</a>

                    <div className="settings__rail-section">DATA</div>
                    <a href="/app/settings/enricher-data">Booster Data</a>
                </aside>

                {/* Body */}
                <div>
                    {/* Plan banner */}
                    <div className="stx-plan">
                        <span className="stx-plan__icon">✦</span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                            <span className="stx-plan__title">
                                {isAthlete ? 'ATHLETE · UNLIMITED SYNCS' : 'HOBBYIST'}
                            </span>
                            <span className="stx-plan__meta">
                                {syncsUsed} / {maxSyncs} SYNCS THIS MONTH
                            </span>
                        </div>
                        <a href="/app/settings/subscription" className="fg-button fg-button--ink fg-button--sm">
                            {isAthlete ? 'MANAGE →' : 'UPGRADE →'}
                        </a>
                    </div>

                    {/* Profile section */}
                    <section className="stx-section">
                        <div className="stx-section__head">
                            <div>
                                <h2>YOUR PROFILE</h2>
                                <p className="stx-section__sub">How you appear on Showcase pages.</p>
                            </div>
                        </div>
                        <div className="stx-section__body">
                            {/* Avatar */}
                            <div className="stx-field">
                                <div className="stx-field__label">Avatar</div>
                                <div className="stx-field__input">
                                    <div className="stx-avatar-row">
                                        <div className="stx-avatar">{getInitial()}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                                Managed via Showcase settings
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Display Name */}
                            <div className="stx-field">
                                <div className="stx-field__label">Display Name</div>
                                <div className="stx-field__input">
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', maxWidth: 480 }}>
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            placeholder="Your name"
                                            disabled={savingName}
                                            style={{ flex: 1 }}
                                        />
                                        {isNameDirty && (
                                            <button
                                                className="fg-button fg-button--sm"
                                                onClick={handleSaveName}
                                                disabled={savingName || !editedName.trim()}
                                            >
                                                {savingName ? 'SAVING…' : 'SAVE'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="stx-field">
                                <div className="stx-field__label">Email</div>
                                <div className="stx-field__input">
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', maxWidth: 480 }}>
                                        <input
                                            type="email"
                                            value={editedEmail}
                                            onChange={(e) => {
                                                setEditedEmail(e.target.value);
                                                setEmailSent(false);
                                                setEmailError('');
                                            }}
                                            placeholder="your@email.com"
                                            disabled={savingEmail}
                                            style={{ flex: 1 }}
                                        />
                                        {isEmailDirty && !emailSent && (
                                            <button
                                                className="fg-button fg-button--sm"
                                                onClick={handleSaveEmail}
                                                disabled={savingEmail || !editedEmail.trim()}
                                            >
                                                {savingEmail ? 'SENDING…' : 'SAVE'}
                                            </button>
                                        )}
                                    </div>
                                    {emailSent && (
                                        <p className="stx-field__help">
                                            <span className="fg-stamp fg-stamp--green" style={{ marginRight: '0.5rem' }}>✓ SENT</span>
                                            Check {editedEmail} for the verification link.
                                        </p>
                                    )}
                                    {emailError && (
                                        <p className="stx-field__help" style={{ color: 'var(--fg-rose)' }}>{emailError}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Security section */}
                    {hasPasswordProvider && (
                        <section className="stx-section">
                            <div className="stx-section__head">
                                <div>
                                    <h2>LOGIN &amp; SECURITY</h2>
                                    <p className="stx-section__sub">Email, password, two-factor.</p>
                                </div>
                            </div>
                            <div className="stx-section__body">
                                <div className="stx-field">
                                    <div className="stx-field__label">Current Password</div>
                                    <div className="stx-field__input">
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                                            placeholder="Enter current password"
                                            disabled={changingPassword}
                                        />
                                    </div>
                                </div>
                                <div className="stx-field">
                                    <div className="stx-field__label">New Password</div>
                                    <div className="stx-field__input">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                                            placeholder="Min 6 characters"
                                            disabled={changingPassword}
                                        />
                                    </div>
                                </div>
                                <div className="stx-field">
                                    <div className="stx-field__label">Confirm Password</div>
                                    <div className="stx-field__input">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                                            placeholder="Re-enter new password"
                                            disabled={changingPassword}
                                        />
                                        {passwordError && <p className="stx-field__help" style={{ color: 'var(--fg-rose)' }}>{passwordError}</p>}
                                        {passwordSuccess && <p className="stx-field__help" style={{ color: 'var(--fg-green)' }}>{passwordSuccess}</p>}
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <button
                                                className="fg-button fg-button--sm"
                                                onClick={handleChangePassword}
                                                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                                            >
                                                {changingPassword ? 'CHANGING…' : 'CHANGE PASSWORD'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Notifications section */}
                    <div className="fg-band fg-band--ink">
                        <span className="fg-band__label">NOTIFICATIONS</span>
                    </div>
                    <section className="stx-section">
                        <div className="stx-section__body" style={{ padding: 0 }}>
                            <NotificationPreferencesCard />
                        </div>
                    </section>

                    {/* Data Rights section */}
                    <section className="stx-section">
                        <div className="stx-section__head">
                            <div>
                                <h2>DATA RIGHTS</h2>
                                <p className="stx-section__sub">GDPR — your right to access, rectify, and delete your personal data.</p>
                            </div>
                        </div>
                        <div className="stx-section__body">
                            <div className="stx-field">
                                <div className="stx-field__label">Export Data</div>
                                <div className="stx-field__input">
                                    {exportStatus === 'idle' && (
                                        <button className="fg-button fg-button--ink fg-button--sm" onClick={handleExportData}>
                                            DOWNLOAD MY DATA
                                        </button>
                                    )}
                                    {(exportStatus === 'pending' || exportStatus === 'running') && (
                                        <>
                                            <button className="fg-button fg-button--ink fg-button--sm" disabled>
                                                {exportStatus === 'pending' ? '⏳ STARTING…' : '⏳ PREPARING…'}
                                            </button>
                                            <p className="stx-field__help">This may take a few minutes. You&apos;ll also receive an email.</p>
                                        </>
                                    )}
                                    {exportStatus === 'completed' && exportDownloadUrl && (
                                        <>
                                            <a href={exportDownloadUrl} className="fg-button fg-button--sm">
                                                DOWNLOAD EXPORT (ZIP)
                                            </a>
                                            <p className="stx-field__help">Link expires in 24 hours. A copy was also sent to your email.</p>
                                        </>
                                    )}
                                    {exportStatus === 'failed' && (
                                        <>
                                            <p className="stx-field__help" style={{ color: 'var(--fg-rose)' }}>{exportError}</p>
                                            <button className="fg-button fg-button--ink fg-button--sm" onClick={handleExportData}>
                                                TRY AGAIN
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Nerd Mode — Advanced */}
                    {isNerdMode && (
                        <section className="stx-section">
                            <div className="stx-section__head">
                                <div>
                                    <h2>ADVANCED</h2>
                                    <p className="stx-section__sub">Developer details — nerd mode only.</p>
                                </div>
                            </div>
                            <div className="stx-section__body">
                                <div className="stx-field">
                                    <div className="stx-field__label">User ID</div>
                                    <div className="stx-field__input">
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <code style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.75rem', color: 'var(--fg-cyan)', background: 'var(--fg-ink)', padding: '0.5rem 0.75rem' }}>
                                                {firebaseUser?.uid || 'N/A'}
                                            </code>
                                            <button
                                                className="fg-button fg-button--ghost fg-button--sm"
                                                onClick={handleCopyUserId}
                                            >
                                                {copied ? '✓ COPIED' : 'COPY'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Danger Zone */}
                    <div className="stx-danger">
                        <h3>DANGER ZONE</h3>
                        <div className="stx-field" style={{ borderBottom: 0 }}>
                            <div className="stx-field__label">Delete Account</div>
                            <div className="stx-field__input">
                                <p className="stx-field__help" style={{ marginBottom: '0.75rem' }}>
                                    This action is <strong style={{ color: 'var(--fg-paper)' }}>permanent and irreversible</strong>.
                                    Removes your profile, pipelines, run history and all synced activities.
                                </p>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    disabled={deleting}
                                    style={{ maxWidth: 320, marginBottom: '0.75rem' }}
                                />
                                {deleteError && <p className="stx-field__help" style={{ color: 'var(--fg-rose)', marginBottom: '0.75rem' }}>{deleteError}</p>}
                                <div>
                                    <button
                                        className="fg-button fg-button--sm"
                                        style={{ background: 'var(--fg-rose)', color: 'var(--fg-paper)' }}
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmation !== 'DELETE' || deleting}
                                    >
                                        {deleting ? 'DELETING…' : 'DELETE ACCOUNT & ALL DATA'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Re-authentication Modal */}
            {firebaseUser && hasPasswordProvider && (
                <ReauthModal
                    user={firebaseUser}
                    isOpen={showReauthModal}
                    onSuccess={handleReauthSuccess}
                    onCancel={() => setShowReauthModal(false)}
                    description="Your session has expired. Please enter your password to continue changing your email."
                />
            )}
        </div>
    );
};

export default AccountSettingsPage;
