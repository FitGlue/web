import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, Badge, Code, List, ListItem, GlowCard, Avatar, ProgressBar, useToast } from '../components/library/ui';
import { Link } from '../components/library/navigation';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { userAtom } from '../state/authState';
import { useNerdMode } from '../state/NerdModeContext';
import { initFirebase } from '../../shared/firebase';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST, HOBBYIST_TIER_LIMITS } from '../utils/tier';
import { Input, FormField } from '../components/library/forms';
import { NotificationPreferencesCard } from '../components/NotificationPreferencesCard';

const AccountSettingsPage: React.FC = () => {
    const [firebaseUser] = useAtom(userAtom);
    const { user: profile } = useUser();
    const api = useApi();
    const toast = useToast();
    const { isNerdMode } = useNerdMode();

    // Name editing - always visible, dirty state detection
    const [editedName, setEditedName] = useState('');
    const [savingName, setSavingName] = useState(false);

    // Email editing - inline with dirty detection
    const [editedEmail, setEditedEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);

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
            const fb = await initFirebase();
            if (!fb) throw new Error('Firebase not initialized');

            await verifyBeforeUpdateEmail(firebaseUser, editedEmail.trim());
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

    const handleExportData = async () => {
        setExportStatus('pending');
        setExportError(null);
        setExportDownloadUrl(null);

        try {
            const response = await api.post('/export/full');
            const jobId = response.jobId as string;

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.get(`/export/status/${jobId}`);
                    if (status.status === 'COMPLETED') {
                        clearInterval(pollInterval);
                        setExportStatus('completed');
                        setExportDownloadUrl(status.downloadUrl as string);
                        toast.success('Export Ready', 'Your data export is ready to download');
                    } else if (status.status === 'FAILED') {
                        clearInterval(pollInterval);
                        setExportStatus('failed');
                        setExportError(status.error as string || 'Export failed');
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

    const connectionCount = [
        profile?.integrations?.strava?.connected,
        profile?.integrations?.fitbit?.connected,
        profile?.integrations?.hevy?.connected
    ].filter(Boolean).length;

    const effectiveTier = profile ? getEffectiveTier(profile) : TIER_HOBBYIST;
    const isAthlete = effectiveTier === TIER_ATHLETE;
    const maxSyncs = isAthlete ? '∞' : String(HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH);
    const syncsUsed = profile?.syncCountThisMonth ?? 0;

    // Get user initial for avatar
    const getInitial = () => {
        if (firebaseUser?.displayName) {
            return firebaseUser.displayName[0].toUpperCase();
        }
        if (firebaseUser?.email) {
            return firebaseUser.email[0].toUpperCase();
        }
        return '?';
    };

    return (
        <PageLayout
            title="Account Settings"
            backTo="/"
            backLabel="Dashboard"
        >
            <Stack gap="lg">
                {/* Profile Card */}
                <Card>
                    <Stack gap="md">
                        <Heading level={3}>Profile</Heading>
                        <Stack direction="horizontal" gap="lg" align="start">
                            <Avatar initial={getInitial()} size="lg" />
                            <Stack gap="md" fullWidth>
                                {/* Name field - always editable with dirty detection */}
                                <FormField label="Name" htmlFor="profile-name">
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <Input
                                            id="profile-name"
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            placeholder="Your name"
                                            disabled={savingName}
                                        />
                                        {isNameDirty && (
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={handleSaveName}
                                                disabled={savingName || !editedName.trim()}
                                            >
                                                {savingName ? 'Saving...' : 'Save'}
                                            </Button>
                                        )}
                                    </Stack>
                                </FormField>

                                {/* Email field - editable with verification on save */}
                                <FormField label="Email" htmlFor="profile-email">
                                    <Stack gap="xs">
                                        <Stack direction="horizontal" gap="sm" align="center">
                                            <Input
                                                id="profile-email"
                                                type="email"
                                                value={editedEmail}
                                                onChange={(e) => {
                                                    setEditedEmail(e.target.value);
                                                    setEmailSent(false);
                                                    setEmailError('');
                                                }}
                                                placeholder="your@email.com"
                                                disabled={savingEmail}
                                            />
                                            {isEmailDirty && !emailSent && (
                                                <Button
                                                    variant="primary"
                                                    size="small"
                                                    onClick={handleSaveEmail}
                                                    disabled={savingEmail || !editedEmail.trim()}
                                                >
                                                    {savingEmail ? 'Sending...' : 'Save'}
                                                </Button>
                                            )}
                                        </Stack>
                                        {emailSent && (
                                            <Paragraph size="sm" muted>
                                                ✉️ Verification sent to <strong>{editedEmail}</strong>. Check your inbox.
                                            </Paragraph>
                                        )}
                                        {emailError && (
                                            <Paragraph size="sm">{emailError}</Paragraph>
                                        )}
                                    </Stack>
                                </FormField>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>

                {/* Subscription Card - Premium Styling */}
                <Card highlighted={isAthlete}>
                    <Stack gap="md">
                        <Stack direction="horizontal" justify="between" align="center">
                            <Heading level={3}>Subscription</Heading>
                            <Badge variant={isAthlete ? 'premium' : 'default'}>
                                {isAthlete ? '✨ Athlete' : 'Hobbyist'}
                            </Badge>
                        </Stack>

                        <Grid cols={2} gap="md">
                            <Card variant="elevated">
                                <Stack gap="sm">
                                    <Paragraph size="sm" muted>Syncs This Month</Paragraph>
                                    <Stack direction="horizontal" align="end" gap="xs">
                                        <Heading level={2}>{syncsUsed}</Heading>
                                        <Paragraph inline muted>/ {maxSyncs}</Paragraph>
                                    </Stack>
                                    {!isAthlete && (
                                        <ProgressBar
                                            value={syncsUsed}
                                            max={HOBBYIST_TIER_LIMITS.SYNCS_PER_MONTH}
                                            variant="gradient"
                                            size="sm"
                                        />
                                    )}
                                </Stack>
                            </Card>

                            <Card variant="elevated">
                                <Stack gap="sm">
                                    <Paragraph size="sm" muted>Connections</Paragraph>
                                    <Heading level={2}>{connectionCount}</Heading>
                                </Stack>
                            </Card>
                        </Grid>

                        <Button
                            variant={isAthlete ? 'secondary' : 'primary'}
                            onClick={() => window.location.href = '/app/settings/upgrade'}
                        >
                            {isAthlete ? 'Manage Subscription →' : 'Upgrade to Athlete →'}
                        </Button>
                    </Stack>
                </Card>

                {/* Help & Support Card - Premium Styling */}
                <GlowCard variant="default">
                    <Stack gap="md">
                        <Heading level={3}>Help & Support</Heading>
                        <Grid cols={3} gap="md">
                            <Link to="/help" external>
                                <Card variant="interactive">
                                    <Stack gap="sm" align="center">
                                        <Paragraph size="lg">📚</Paragraph>
                                        <Paragraph size="sm">FAQ & Guides</Paragraph>
                                    </Stack>
                                </Card>
                            </Link>
                            <Link to="mailto:support@fitglue.tech" external>
                                <Card variant="interactive">
                                    <Stack gap="sm" align="center">
                                        <Paragraph size="lg">📧</Paragraph>
                                        <Paragraph size="sm">Contact Support</Paragraph>
                                    </Stack>
                                </Card>
                            </Link>
                            <Link to="/contact" external>
                                <Card variant="interactive">
                                    <Stack gap="sm" align="center">
                                        <Paragraph size="lg">💡</Paragraph>
                                        <Paragraph size="sm">Request a Feature</Paragraph>
                                    </Stack>
                                </Card>
                            </Link>
                        </Grid>
                    </Stack>
                </GlowCard>

                {/* Notification Preferences Card */}
                <NotificationPreferencesCard />

                {/* Data Rights - Always Visible (GDPR) */}
                <Card>
                    <Stack gap="md">
                        <Heading level={3}>📋 Data Rights</Heading>
                        <Paragraph size="sm">
                            Under GDPR you have the right to access, rectify, and delete your personal data.
                            You can export all your data at any time.
                        </Paragraph>
                        {exportStatus === 'idle' && (
                            <Button variant="secondary" onClick={handleExportData}>
                                📦 Download My Data
                            </Button>
                        )}
                        {(exportStatus === 'pending' || exportStatus === 'running') && (
                            <Stack gap="xs">
                                <Button variant="secondary" disabled>
                                    {exportStatus === 'pending' ? '⏳ Starting export...' : '⏳ Preparing your data...'}
                                </Button>
                                <Paragraph size="sm" muted>
                                    This may take a few minutes. You will also receive an email when it is ready.
                                </Paragraph>
                            </Stack>
                        )}
                        {exportStatus === 'completed' && exportDownloadUrl && (
                            <Stack gap="xs">
                                <Link to={exportDownloadUrl} external>
                                    <Button variant="primary">
                                        ⬇️ Download Export (ZIP)
                                    </Button>
                                </Link>
                                <Paragraph size="sm" muted>
                                    This link expires in 24 hours. A copy was also sent to your email.
                                </Paragraph>
                            </Stack>
                        )}
                        {exportStatus === 'failed' && (
                            <Stack gap="xs">
                                <Paragraph size="sm">{exportError}</Paragraph>
                                <Button variant="secondary" onClick={handleExportData}>
                                    🔄 Try Again
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Card>

                {isNerdMode && (
                    <Card>
                        <Heading level={3}>🤓 Advanced</Heading>
                        <Stack gap="md">
                            <Stack gap="xs">
                                <Paragraph size="sm" muted>User ID</Paragraph>
                                <Stack direction="horizontal" gap="sm" align="center">
                                    <Code>
                                        {firebaseUser?.uid || 'N/A'}
                                    </Code>
                                    <Button variant="text" size="small" onClick={handleCopyUserId}>
                                        {copied ? '✓ Copied' : '📋 Copy'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                )}

                {/* Danger Zone */}
                <Card>
                    <Stack gap="md">
                        <Stack direction="horizontal" gap="sm" align="center">
                            <Paragraph inline>⚠️</Paragraph>
                            <Heading level={3}>Danger Zone</Heading>
                        </Stack>
                        <Stack gap="md">
                            <Heading level={4}>Delete Account</Heading>
                            <Stack gap="xs">
                                <Paragraph bold>Right to Erasure (GDPR Article 17)</Paragraph>
                                <Paragraph>
                                    This action is <strong>permanent and irreversible</strong>.
                                    Deleting your account will remove:
                                </Paragraph>
                            </Stack>
                            <List>
                                <ListItem>All your connected integrations (Strava, Fitbit, Hevy)</ListItem>
                                <ListItem>All configured pipelines</ListItem>
                                <ListItem>All synchronized and raw activities</ListItem>
                                <ListItem>All pending inputs</ListItem>
                                <ListItem>All API keys</ListItem>
                            </List>
                            <Stack gap="sm">
                                <FormField label="Type DELETE to confirm:" htmlFor="delete-confirm">
                                    <Input
                                        id="delete-confirm"
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder="Type DELETE"
                                        disabled={deleting}
                                    />
                                </FormField>
                                {deleteError && <Paragraph size="sm">{deleteError}</Paragraph>}
                                <Button
                                    variant="danger"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmation !== 'DELETE' || deleting}
                                    fullWidth
                                >
                                    {deleting ? 'Deleting Account...' : 'Permanently Delete My Account'}
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default AccountSettingsPage;
