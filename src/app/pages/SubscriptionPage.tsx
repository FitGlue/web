import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, Stack, Grid } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, LoadingState, List, ListItem, Badge } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';

const SubscriptionPage: React.FC = () => {
    const api = useApi();
    const { user, loading, refresh } = useUser();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'cancelled'; message: string } | null>(null);

    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        if (billingStatus === 'success') {
            setStatus({ type: 'success', message: 'Success! Your account has been upgraded to Athlete.' });
            refresh();
        } else if (billingStatus === 'cancelled') {
            setStatus({ type: 'cancelled', message: 'Checkout cancelled. No changes were made.' });
        } else if (billingStatus === 'error') {
            setStatus({ type: 'error', message: 'There was an error processing your payment. Please try again.' });
        }
    }, [searchParams, refresh]);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const { url } = await api.post('/billing/checkout') as { url: string };
            window.location.href = url;
        } catch (error) {
            console.error('Failed to start checkout:', error);
            setStatus({ type: 'error', message: 'Failed to start checkout process. Please try again later.' });
            setProcessing(false);
        }
    };

    const handleOpenPortal = async () => {
        setProcessing(true);
        try {
            const { url } = await api.post('/billing/portal') as { url: string };
            window.location.href = url;
        } catch (error) {
            console.error('Failed to open billing portal:', error);
            setStatus({ type: 'error', message: 'Failed to open billing portal. Please try again later.' });
            setProcessing(false);
        }
    };

    if (loading && !user) {
        return (
            <PageLayout title="Subscription">
                <LoadingState />
            </PageLayout>
        );
    }

    const isAthlete = user ? getEffectiveTier(user) === TIER_ATHLETE : false;
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const isOnTrial = isAthlete && trialDaysRemaining > 0;
    const trialExpired = user?.trialEndsAt && trialDaysRemaining <= 0 && !(user as { stripeCustomerId?: string })?.stripeCustomerId && !user?.isAdmin;

    if (isAthlete) {
        return (
            <PageLayout
                title="Your Subscription"
                backTo="/settings/account"
                backLabel="Account"
            >
                <Stack gap="lg">
                    {status && (
                        <Card variant="elevated">
                            <Paragraph>{status.type === 'success' ? '✓ ' : status.type === 'error' ? '⚠️ ' : ''}{status.message}</Paragraph>
                        </Card>
                    )}

                    <Card highlighted>
                        <Stack gap="md">
                            <Stack direction="horizontal" align="center" justify="between">
                                <Badge variant="premium">✨ ATHLETE</Badge>
                                <Paragraph inline>
                                    <span style={{ fontSize: '2rem', fontWeight: 700 }}>£5</span>
                                    <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>/month</span>
                                </Paragraph>
                            </Stack>
                            <Grid cols={2} gap="sm">
                                <Paragraph size="sm">✓ Unlimited Syncs</Paragraph>
                                <Paragraph size="sm">✓ Unlimited Connections</Paragraph>
                                <Paragraph size="sm">✓ Priority Processing</Paragraph>
                                <Paragraph size="sm">✓ All Advanced Enrichers</Paragraph>
                            </Grid>
                        </Stack>
                    </Card>

                    {isOnTrial && (
                        <Stack gap="md">
                            <Heading level={3}>🎉 Trial Period</Heading>
                            <Stack align="center">
                                <Paragraph inline>{trialDaysRemaining}</Paragraph>
                                <Paragraph inline>day{trialDaysRemaining !== 1 ? 's' : ''} remaining</Paragraph>
                            </Stack>
                            <Stack gap="sm">
                                <Paragraph bold>What happens when your trial ends?</Paragraph>
                                <List>
                                    <ListItem>Your account reverts to Hobbyist (free)</ListItem>
                                    <ListItem>Sync limit: 25/month, Connections: 2 max</ListItem>
                                    <ListItem>Your pipelines and data are preserved</ListItem>
                                </List>
                            </Stack>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Subscribe Now - Keep Athlete Features'}
                            </Button>
                        </Stack>
                    )}

                    {trialExpired && (
                        <Card>
                            <Heading level={3}>⚠️ Trial Expired</Heading>
                            <Paragraph>Your Athlete trial has ended. Subscribe now to keep your unlimited features!</Paragraph>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Subscribe to Athlete - £5/month'}
                            </Button>
                        </Card>
                    )}

                    {(user as { stripeCustomerId?: string })?.stripeCustomerId && (
                        <Card>
                            <Heading level={3}>Billing Management</Heading>
                            <Paragraph muted>
                                Manage your payment method, view invoices, or cancel your subscription through Stripe.
                            </Paragraph>
                            <Stack>
                                <Button
                                    variant="secondary"
                                    onClick={handleOpenPortal}
                                    disabled={processing}
                                >
                                    {processing ? 'Opening...' : 'Manage Billing →'}
                                </Button>
                            </Stack>
                        </Card>
                    )}
                </Stack>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Choose Your Plan"
            backTo="/settings/account"
            backLabel="Account"
        >
            <Stack gap="lg">
                {status && (
                    <Card variant="elevated">
                        <Paragraph>{status.type === 'success' ? '✓ ' : status.type === 'error' ? '⚠️ ' : ''}{status.message}</Paragraph>
                    </Card>
                )}

                <Stack align="center" gap="sm">
                    <Heading level={2}>Unlock the full power of FitGlue</Heading>
                    <Paragraph muted>Automate your fitness data with no limits.</Paragraph>
                </Stack>

                <Grid cols={2} gap="lg">
                    <Card>
                        <Badge>Your Current Plan</Badge>
                        <Heading level={3}>Hobbyist</Heading>
                        <Paragraph size="lg" bold>£0<Paragraph inline size="sm">/mo</Paragraph></Paragraph>
                        <List>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> 25 Syncs per month
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> 2 Active connections
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> Basic enrichers
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>○</Paragraph> Priority processing
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>○</Paragraph> Advanced Elastic Match
                            </ListItem>
                        </List>
                        <Button variant="secondary" disabled>
                            Currently Active
                        </Button>
                    </Card>

                    <Card highlighted>
                        <Heading level={3}>Athlete</Heading>
                        <Paragraph size="lg" bold>£5<Paragraph inline size="sm">/mo</Paragraph></Paragraph>
                        <List>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> <strong>Unlimited</strong> Syncs
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> <strong>Unlimited</strong> Connections
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> Priority processing
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> All Advanced Enrichers
                            </ListItem>
                            <ListItem>
                                <Paragraph inline>✓</Paragraph> Custom Sync Scheduling
                            </ListItem>
                        </List>
                        <Button
                            variant="primary"

                            onClick={handleCheckout}
                            disabled={processing}
                        >
                            {processing ? 'Connecting to Stripe...' : 'Upgrade to Athlete'}
                        </Button>
                    </Card>
                </Grid>
            </Stack>
        </PageLayout>
    );
};

export default SubscriptionPage;
