import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout, Stack } from '../components/library/layout';
import { Card, Button, Heading, Paragraph, CardSkeleton, Badge } from '../components/library/ui';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { getEffectiveTier, TIER_ATHLETE } from '../utils/tier';
import '../components/library/ui/CardSkeleton.css';
import './SubscriptionPage.css';

// Feature data for Athlete tier (actual benefits)
const ATHLETE_FEATURES = [
    { icon: '🔄', title: 'Unlimited Syncs', desc: 'No monthly limits' },
    { icon: '🚀', title: 'All Boosters', desc: 'AI summaries, image generation' },
    { icon: '🌟', title: 'Showcase Forever', desc: 'Pages never expire' },
];

// What users lose when downgrading (actual differences)
const DOWNGRADE_ITEMS = [
    { from: 'Unlimited Syncs', to: '25/month' },
    { from: 'All Boosters', to: 'Basic only' },
    { from: 'Showcase Forever', to: '30 day retention' },
];

// Plan comparison features (actual differences only)
const PLAN_FEATURES = [
    { name: 'Monthly Syncs', hobbyist: '25', athlete: 'Unlimited', hobbyistIncluded: true },
    { name: 'Basic Boosters', hobbyist: '✓', athlete: '✓', hobbyistIncluded: true },
    { name: 'AI Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false },
    { name: 'Image Boosters', hobbyist: null, athlete: '✓', hobbyistIncluded: false },
    { name: 'Showcase Retention', hobbyist: '30 days', athlete: 'Forever', hobbyistIncluded: true },
    { name: 'Showcase Profile', hobbyist: null, athlete: '✓ Public Profile', hobbyistIncluded: false },
];

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
                    <div className="subscription-athlete-card">
                        <div className="subscription-athlete-card__header">
                            <h2>✨ ATHLETE</h2>
                            {user?.isAdmin ? (
                                <div className="subscription-admin-badge">
                                    🛡️ Admin Access
                                </div>
                            ) : (
                                <div className="subscription-athlete-card__price">
                                    £5<span className="subscription-athlete-card__price-period">/month</span>
                                </div>
                            )}
                        </div>
                        <div className="subscription-athlete-card__content">
                            {/* Feature Grid */}
                            <Stack gap="md">
                                <Heading level={4}>Your Athlete Benefits</Heading>
                                <div className="subscription-features-grid">
                                    {ATHLETE_FEATURES.map((feature) => (
                                        <div key={feature.title} className="subscription-feature-card">
                                            <span className="subscription-feature-card__icon">{feature.icon}</span>
                                            <div className="subscription-feature-card__content">
                                                <div className="subscription-feature-card__title">{feature.title}</div>
                                                <div className="subscription-feature-card__desc">{feature.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Stack>
                        </div>
                    </div>

                    {/* Trial Countdown - Only for trial users */}
                    {isOnTrial && (
                        <Card>
                            <div className="subscription-countdown">
                                <div
                                    className="subscription-countdown__ring"
                                    style={{ '--countdown-progress': `${countdownProgress}%` } as React.CSSProperties}
                                >
                                    <div className="subscription-countdown__ring-bg" />
                                    <span className="subscription-countdown__days">{trialDaysRemaining}</span>
                                </div>
                                <div className="subscription-countdown__label">
                                    day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your trial
                                </div>
                                {trialDaysRemaining <= 7 && (
                                    <div className="subscription-countdown__urgency">
                                        ⚠️ Less than a week left!
                                    </div>
                                )}
                            </div>

                            {/* What You'll Lose Section */}
                            <div className="subscription-lose-section">
                                <div className="subscription-lose-section__title">
                                    ⚠️ What you&apos;ll lose when your trial ends
                                </div>
                                {DOWNGRADE_ITEMS.map((item) => (
                                    <div key={item.from} className="subscription-lose-item">
                                        <span className="subscription-lose-item__icon">✕</span>
                                        <span className="subscription-lose-item__from">{item.from}</span>
                                        <span className="subscription-lose-item__arrow">→</span>
                                        <span className="subscription-lose-item__to">{item.to}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="subscription-cta-wrapper">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="subscription-cta"
                                >
                                    {processing ? 'Processing...' : 'Subscribe Now - Keep Your Athlete Features'}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Trial Expired Warning */}
                    {trialExpired && (
                        <div className="subscription-lose-section">
                            <div className="subscription-lose-section__title">
                                ⚠️ Your Trial Has Ended
                            </div>
                            <Paragraph>
                                Subscribe now to restore your unlimited features and keep your Athlete benefits.
                            </Paragraph>
                            <div className="subscription-cta-wrapper">
                                <Button
                                    variant="primary"
                                    onClick={handleCheckout}
                                    disabled={processing}
                                    className="subscription-cta"
                                >
                                    {processing ? 'Processing...' : 'Subscribe to Athlete - £5/month'}
                                </Button>
                            </div>
                        </div>
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
                <div className="subscription-hero">
                    <h1 className="subscription-hero__title">Unlock Your Full Potential</h1>
                    <p className="subscription-hero__subtitle">
                        Upgrade to Athlete and automate your fitness data without limits.
                    </p>
                </div>

                {/* Plan Comparison Grid */}
                <div className="subscription-plans-grid">
                    {/* Hobbyist Plan */}
                    <div className="subscription-plan-card subscription-plan-card--current">
                        <div className="subscription-plan-card__header">
                            <Badge>Current Plan</Badge>
                            <div className="subscription-plan-card__name">Hobbyist</div>
                            <div className="subscription-plan-card__price">
                                £0<span className="subscription-plan-card__period">/month</span>
                            </div>
                        </div>
                        <ul className="subscription-plan-features">
                            {PLAN_FEATURES.map((feature) => (
                                <li key={feature.name} className="subscription-plan-feature">
                                    <span className={`subscription-plan-feature__icon--${feature.hobbyistIncluded ? 'included' : 'excluded'}`}>
                                        {feature.hobbyistIncluded ? '✓' : '○'}
                                    </span>
                                    <span className={feature.hobbyistIncluded ? '' : 'subscription-plan-feature__text--excluded'}>
                                        {feature.name}{feature.hobbyist && feature.hobbyistIncluded ? `: ${feature.hobbyist}` : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Button variant="secondary" disabled>
                            Currently Active
                        </Button>
                    </div>

                    {/* Athlete Plan */}
                    <div className="subscription-plan-card subscription-plan-card--recommended">
                        <div className="subscription-plan-card__header">
                            <Badge variant="premium">✨ ATHLETE</Badge>
                            <div className="subscription-plan-card__name">Athlete</div>
                            <div className="subscription-plan-card__price">
                                £5<span className="subscription-plan-card__period">/month</span>
                            </div>
                        </div>
                        <ul className="subscription-plan-features">
                            {PLAN_FEATURES.map((feature) => (
                                <li key={feature.name} className="subscription-plan-feature">
                                    <span className="subscription-plan-feature__icon--included">✓</span>
                                    <span>
                                        {feature.name}{feature.athlete !== '✓' ? `: ${feature.athlete}` : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="primary"
                            onClick={handleCheckout}
                            disabled={processing}
                            className="subscription-cta"
                        >
                            {processing ? 'Connecting to Stripe...' : 'Upgrade to Athlete'}
                        </Button>
                    </div>
                </div>

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
