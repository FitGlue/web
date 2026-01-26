import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { PageLayout, Stack } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, Badge, Code, List, ListItem, Modal } from '../components/library/ui';
import { Link } from '../components/library/navigation';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { userAtom } from '../state/authState';
import { useNerdMode } from '../state/NerdModeContext';
import { initFirebase } from '../../shared/firebase';
import { getEffectiveTier, TIER_ATHLETE, TIER_HOBBYIST, HOBBYIST_TIER_LIMITS } from '../utils/tier';
import { Input, FormField } from '../components/library/forms';

const ProfileAvatar: React.FC<{ name?: string; email?: string }> = ({
    name,
    email,
}) => {
    const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?';

    return (
        <Badge variant="default" size="md">{initial}</Badge>
    );
};

const AccountSettingsPage: React.FC = () => {
    const [firebaseUser] = useAtom(userAtom);
    const { user: profile } = useUser();
    const api = useApi();
    const { isNerdMode } = useNerdMode();

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [savingName, setSavingName] = useState(false);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [emailError, setEmailError] = useState('');

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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
            <Stack gap="lg">
                <Card>
                    <Heading level={3}>Profile</Heading>
                    <Stack direction="horizontal" gap="lg">
                        <ProfileAvatar
                            name={firebaseUser?.displayName || undefined}
                            email={firebaseUser?.email || undefined}
                        />
                        <Stack gap="md">
                            <Stack gap="xs">
                                <Paragraph size="sm" muted>Name</Paragraph>
                                {isEditingName ? (
                                    <Stack direction="horizontal" gap="sm" align="center">
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
                                    </Stack>
                                ) : (
                                    <Stack direction="horizontal" gap="sm" align="center">
                                        <Paragraph>
                                            {firebaseUser?.displayName || <em>Not set</em>}
                                        </Paragraph>
                                        <Button variant="text" size="small" onClick={() => setIsEditingName(true)}>
                                            ✏️
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>

                            <Stack gap="xs">
                                <Paragraph size="sm" muted>Email</Paragraph>
                                <Stack direction="horizontal" gap="sm" align="center">
                                    <Paragraph>{firebaseUser?.email || 'N/A'}</Paragraph>
                                    <Button variant="text" size="small" onClick={() => setShowEmailModal(true)}>
                                        Change
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </Card>

                <Card>
                    <Heading level={3}>Subscription</Heading>
                    <Stack gap="md">
                        <Stack gap="xs">
                            <Paragraph size="sm" muted>Plan</Paragraph>
                            <Stack direction="horizontal" gap="sm" align="center">
                                <Badge variant={effectiveTier === TIER_ATHLETE ? 'premium' : 'default'}>
                                    {effectiveTier === TIER_ATHLETE ? 'Athlete' : 'Hobbyist'}
                                </Badge>
                                <Button variant="text" size="small" onClick={() => window.location.href = '/app/settings/upgrade'}>
                                    {effectiveTier === TIER_ATHLETE ? 'Manage →' : 'Upgrade →'}
                                </Button>
                            </Stack>
                        </Stack>
                        <Stack gap="xs">
                            <Paragraph size="sm" muted>Syncs</Paragraph>
                            <Paragraph>
                                {profile?.syncCountThisMonth ?? 0} / {maxSyncs} this month
                            </Paragraph>
                        </Stack>
                        <Stack gap="xs">
                            <Paragraph size="sm" muted>Connections</Paragraph>
                            <Paragraph>
                                {connectionCount} / {maxConnections}
                            </Paragraph>
                        </Stack>
                    </Stack>
                </Card>

                <Card>
                    <Heading level={3}>Help & Support</Heading>
                    <Stack direction="horizontal" gap="md" wrap>
                        <Link to="/help">
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>📚</Paragraph>
                                <Paragraph inline>FAQ & Guides</Paragraph>
                            </Stack>
                        </Link>
                        <Link to="mailto:support@fitglue.tech" external>
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>📧</Paragraph>
                                <Paragraph inline>Contact Support</Paragraph>
                            </Stack>
                        </Link>
                        <Link to="/feedback">
                            <Stack direction="horizontal" gap="xs" align="center">
                                <Paragraph inline>💡</Paragraph>
                                <Paragraph inline>Request a Feature</Paragraph>
                            </Stack>
                        </Link>
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
                            <Stack gap="sm">
                                <Paragraph size="sm" muted>Data Rights</Paragraph>
                                <Stack gap="xs">
                                    <Paragraph size="sm">
                                        Under GDPR you have the right to access, rectify, and delete your personal data.
                                    </Paragraph>
                                    <Link to="mailto:privacy@fitglue.tech" external variant="primary">
                                        Request data export (Subject Access Request)
                                    </Link>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                )}

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

            <Modal
                isOpen={showEmailModal}
                onClose={() => {
                    if (emailChangeStatus !== 'sending') {
                        setShowEmailModal(false);
                        setEmailChangeStatus('idle');
                        setNewEmail('');
                        setEmailError('');
                    }
                }}
                title="Change Email Address"
            >
                {emailChangeStatus === 'sent' ? (
                    <Stack align="center" gap="md">
                        <Paragraph size="lg">✉️</Paragraph>
                        <Paragraph>Verification email sent to <strong>{newEmail}</strong></Paragraph>
                        <Paragraph size="sm" muted>
                            Click the link in the email to confirm your new address.
                        </Paragraph>
                        <Button variant="primary" onClick={() => {
                            setShowEmailModal(false);
                            setEmailChangeStatus('idle');
                            setNewEmail('');
                        }}>
                            Done
                        </Button>
                    </Stack>
                ) : (
                    <Stack gap="md">
                        <Paragraph>
                            Current: <strong>{firebaseUser?.email}</strong>
                        </Paragraph>
                        <FormField label="New Email Address" htmlFor="new-email">
                            <Input
                                id="new-email"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new@email.com"
                                disabled={emailChangeStatus === 'sending'}
                            />
                        </FormField>
                        {emailError && (
                            <Paragraph size="sm">{emailError}</Paragraph>
                        )}
                        <Stack direction="horizontal" justify="end" gap="sm">
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
                        </Stack>
                    </Stack>
                )}
            </Modal>
        </PageLayout>
    );
};

export default AccountSettingsPage;
