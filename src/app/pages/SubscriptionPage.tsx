import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, Stack, Grid, FeatureItem } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, CardSkeleton, Badge, GlowCard } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import { ATHLETE_BENEFITS, PLAN_FEATURES, DOWNGRADE_ITEMS } from '../utils/tierBenefits';
import '../components/library/ui/CardSkeleton.css';
import './SubscriptionPage.css';

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
                <Stack gap="lg">
                    <CardSkeleton variant="integration" />
                    <CardSkeleton variant="integration" />
                </Stack>
            </PageLayout>
        );
    }

    const isAthlete = user ? getEffectiveTier(user) === TIER_ATHLETE : false;
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const isOnTrial = isAthlete && trialDaysRemaining > 0;
    const trialExpired = user?.trialEndsAt && trialDaysRemaining <= 0 && !(user as { stripeCustomerId?: string })?.stripeCustomerId && !user?.isAdmin;
    const countdownProgress = Math.max(0, Math.min(100, (trialDaysRemaining / 30) * 100));

    // ATHLETE VIEW - Premium experience for current Athletes
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

                    {/* Premium Athlete Card */}
                    <GlowCard
                        variant="success"
                        header={
                            <Stack direction="horizontal" align="center" justify="between">
                                <Heading level={2}>✨ ATHLETE</Heading>
                                {user?.isAdmin ? (
                                    <Badge className="subscription-admin-badge">
                                        🛡️ Admin Access
                                    </Badge>
                                ) : (
                                    <Stack className="subscription-athlete-card__price" direction="horizontal" align="baseline">
                                        <Paragraph inline>£5</Paragraph>
                                        <Paragraph inline className="subscription-athlete-card__price-period">/month</Paragraph>
                                    </Stack>
                                )}
                            </Stack>
                        }
                    >
                        <Heading level={4}>Your Athlete Benefits</Heading>
                        <Grid cols={2} gap="md">
                            {ATHLETE_BENEFITS.map((feature) => (
                                <Card key={feature.title} className="subscription-feature-card">
                                    <FeatureItem
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.desc}
                                    />
                                </Card>
                            ))}
                        </Grid>
                    </GlowCard>

                    {/* Trial Countdown - Only for trial users */}
                    {isOnTrial && (
                        <Card>
                            <Stack className="subscription-countdown" align="center" gap="md">
                                <Stack
                                    className="subscription-countdown__ring"
                                    style={{ '--countdown-progress': `${countdownProgress}%` } as React.CSSProperties}
                                    align="center"
                                    justify="center"
                                >
                                    <Stack className="subscription-countdown__ring-bg" />
                                    <Paragraph inline className="subscription-countdown__days">{trialDaysRemaining}</Paragraph>
                                </Stack>
                                <Paragraph className="subscription-countdown__label">
                                    day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your trial
                                </Paragraph>
                                {trialDaysRemaining <= 7 && (
                                    <Paragraph className="subscription-countdown__urgency">
                                        ⚠️ Less than a week left!
                                    </Paragraph>
                                )}
                            </Stack>

                            {/* What You'll Lose Section */}
                            <Stack className="subscription-lose-section" gap="sm">
                                <Paragraph className="subscription-lose-section__title">
                                    ⚠️ What you&apos;ll lose when your trial ends
                                </Paragraph>
                                {DOWNGRADE_ITEMS.map((item) => (
                                    <Stack key={item.from} className="subscription-lose-item" direction="horizontal" gap="sm" align="center">
                                        <Paragraph inline className="subscription-lose-item__icon">✕</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__from">{item.from}</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__arrow">→</Paragraph>
                                        <Paragraph inline className="subscription-lose-item__to">{item.to}</Paragraph>
                                    </Stack>
                                ))}
                            </Stack>

                            <Stack className="subscription-cta-wrapper" align="center">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="subscription-cta"
                                >
                                    {processing ? 'Processing...' : 'Subscribe Now - Keep Your Athlete Features'}
                                </Button>
                            </Stack>
                        </Card>
                    )}

                    {/* Trial Expired Warning */}
                    {trialExpired && (
                        <Stack className="subscription-lose-section" gap="md">
                            <Paragraph className="subscription-lose-section__title">
                                ⚠️ Your Trial Has Ended
                            </Paragraph>
                            <Paragraph>
                                Subscribe now to restore your unlimited features and keep your Athlete benefits.
                            </Paragraph>
                            <Stack className="subscription-cta-wrapper" align="center">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="subscription-cta"
                                >
                                    {processing ? 'Processing...' : 'Subscribe to Athlete - £5/month'}
                                </Button>
                            </Stack>
                        </Stack>
                    )}

                    {/* Billing Portal for Paid Users */}
                    {(user as { stripeCustomerId?: string })?.stripeCustomerId && (
                        <Card>
                            <Stack gap="md">
                                <Heading level={4}>Billing Management</Heading>
                                <Paragraph muted>
                                    Manage your payment method, view invoices, or update your subscription through the Stripe portal.
                                </Paragraph>
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

    // HOBBYIST VIEW - Conversion-focused upgrade prompt
    return (
        <PageLayout
            title="Choose Your Plan"
            backTo="/settings/account"
            backLabel="Account"
        >
            <Stack gap="xl">
                {status && (
                    <Card variant="elevated">
                        <Paragraph>{status.type === 'success' ? '✓ ' : status.type === 'error' ? '⚠️ ' : ''}{status.message}</Paragraph>
                    </Card>
                )}

                {/* Hero Section */}
                <Stack className="subscription-hero" align="center" gap="sm">
                    <Heading level={1} className="subscription-hero__title">Unlock Your Full Potential</Heading>
                    <Paragraph className="subscription-hero__subtitle">
                        Upgrade to Athlete and automate your fitness data without limits.
                    </Paragraph>
                </Stack>

                {/* Plan Comparison Grid */}
                <Stack className="subscription-plans-grid" direction="horizontal" gap="lg">
                    {/* Hobbyist Plan */}
                    <Card className="subscription-plan-card subscription-plan-card--current">
                        <Stack className="subscription-plan-card__header" gap="sm" align="center">
                            <Badge>Current Plan</Badge>
                            <Paragraph className="subscription-plan-card__name">Hobbyist</Paragraph>
                            <Stack className="subscription-plan-card__price" direction="horizontal" align="baseline">
                                <Paragraph inline>£0</Paragraph>
                                <Paragraph inline className="subscription-plan-card__period">/month</Paragraph>
                            </Stack>
                        </Stack>
                        <Stack className="subscription-plan-features" gap="sm">
                            {PLAN_FEATURES.map((feature) => (
                                <Stack key={feature.name} className="subscription-plan-feature" direction="horizontal" gap="sm" align="center">
                                    <Paragraph inline className={`subscription-plan-feature__icon--${feature.hobbyistIncluded ? 'included' : 'excluded'}`}>
                                        {feature.hobbyistIncluded ? '✓' : '○'}
                                    </Paragraph>
                                    <Paragraph inline className={feature.hobbyistIncluded ? '' : 'subscription-plan-feature__text--excluded'}>
                                        {feature.name}{feature.hobbyist && feature.hobbyistIncluded ? `: ${feature.hobbyist}` : ''}
                                    </Paragraph>
                                </Stack>
                            ))}
                        </Stack>
                        <Button variant="secondary" disabled>
                            Currently Active
                        </Button>
                    </Card>

                    {/* Athlete Plan */}
                    <Card className="subscription-plan-card subscription-plan-card--recommended">
                        <Stack className="subscription-plan-card__header" gap="sm" align="center">
                            <Badge variant="premium">✨ ATHLETE</Badge>
                            <Paragraph className="subscription-plan-card__name">Athlete</Paragraph>
                            <Stack className="subscription-plan-card__price" direction="horizontal" align="baseline">
                                <Paragraph inline>£5</Paragraph>
                                <Paragraph inline className="subscription-plan-card__period">/month</Paragraph>
                            </Stack>
                        </Stack>
                        <Stack className="subscription-plan-features" gap="sm">
                            {PLAN_FEATURES.map((feature) => (
                                <Stack key={feature.name} className="subscription-plan-feature" direction="horizontal" gap="sm" align="center">
                                    <Paragraph inline className="subscription-plan-feature__icon--included">✓</Paragraph>
                                    <Paragraph inline>
                                        {feature.name}{feature.athlete !== '✓' ? `: ${feature.athlete}` : ''}
                                    </Paragraph>
                                </Stack>
                            ))}
                        </Stack>
                        <Button
                            variant="primary"
                            onClick={handleCheckout}
                            disabled={processing}
                            className="subscription-cta"
                        >
                            {processing ? 'Connecting to Stripe...' : 'Upgrade to Athlete'}
                        </Button>
                    </Card>
                </Stack>

                {/* Value Proposition */}
                <Card>
                    <Stack align="center" gap="sm">
                        <Paragraph muted>
                            Cancel anytime • Secure payment via Stripe • 30-day trial on signup
                        </Paragraph>
                    </Stack>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default SubscriptionPage;
