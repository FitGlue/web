import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useApi } from '../hooks/useApi';
import { useUser } from '../hooks/useUser';
import { LoadingState } from '../components/ui/LoadingState';
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
                <LoadingState />
            </PageLayout>
        );
    }

    const isAthlete = user?.tier === 'pro';
    const trialDaysRemaining = user?.trialEndsAt
        ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const isOnTrial = isAthlete && trialDaysRemaining > 0;
    const trialExpired = user?.trialEndsAt && trialDaysRemaining <= 0 && !(user as { stripeCustomerId?: string })?.stripeCustomerId;

    // Athlete users see a management view
    if (isAthlete) {
        return (
            <PageLayout
                title="Your Subscription"
                backTo="/settings/account"
                backLabel="Account"
            >
                <div className="subscription-container">
                    {status && (
                        <div className={`billing-status ${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    {/* Current Plan Card */}
                    <Card className="subscription-card current-plan">
                        <div className="plan-header">
                            <span className="plan-badge athlete">✨ ATHLETE</span>
                            <span className="plan-price">£5<span>/month</span></span>
                        </div>
                        <ul className="plan-benefits">
                            <li>✓ Unlimited Syncs</li>
                            <li>✓ Unlimited Connections</li>
                            <li>✓ Priority Processing</li>
                            <li>✓ All Advanced Enrichers</li>
                        </ul>
                    </Card>

                    {/* Trial Section */}
                    {isOnTrial && (
                        <Card className="subscription-card trial-section">
                            <h3>🎉 Trial Period</h3>
                            <div className="trial-countdown">
                                <span className="days-number">{trialDaysRemaining}</span>
                                <span className="days-label">day{trialDaysRemaining !== 1 ? 's' : ''} remaining</span>
                            </div>
                            <div className="trial-info">
                                <p><strong>What happens when your trial ends?</strong></p>
                                <ul>
                                    <li>Your account reverts to Hobbyist (free)</li>
                                    <li>Sync limit: 25/month, Connections: 2 max</li>
                                    <li>Your pipelines and data are preserved</li>
                                </ul>
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Subscribe Now - Keep Athlete Features'}
                            </Button>
                        </Card>
                    )}

                    {/* Trial Expired Warning */}
                    {trialExpired && (
                        <Card className="subscription-card trial-expired">
                            <h3>⚠️ Trial Expired</h3>
                            <p>Your Athlete trial has ended. Subscribe now to keep your unlimited features!</p>
                            <Button
                                variant="primary"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Subscribe to Athlete - £5/month'}
                            </Button>
                        </Card>
                    )}

                    {/* Billing Management for paid subscribers */}
                    {(user as { stripeCustomerId?: string })?.stripeCustomerId && (
                        <Card className="subscription-card billing-section">
                            <h3>Billing Management</h3>
                            <p className="billing-description">
                                Manage your payment method, view invoices, or cancel your subscription through Stripe.
                            </p>
                            <div className="billing-actions">
                                <Button
                                    variant="secondary"
                                    onClick={handleOpenPortal}
                                    disabled={processing}
                                >
                                    {processing ? 'Opening...' : 'Manage Billing →'}
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </PageLayout>
        );
    }

    // Hobbyist users see upgrade options
    return (
        <PageLayout
            title="Choose Your Plan"
            backTo="/settings/account"
            backLabel="Account"
        >
            <div className="pricing-container">
                {status && (
                    <div className={`billing-status ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <div className="pricing-header">
                    <h2>Unlock the full power of FitGlue</h2>
                    <p className="tagline">Automate your fitness data with no limits.</p>
                </div>

                <div className="pricing-grid">
                    {/* Hobbyist Tier */}
                    <Card className="pricing-card current">
                        <div className="current-tier-tab">Your Current Plan</div>
                        <div className="tier-name">Hobbyist</div>
                        <div className="tier-price">£0<span>/mo</span></div>
                        <ul className="feature-list">
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> 25 Syncs per month
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> 2 Active connections
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Basic enrichers
                            </li>
                            <li className="feature-item disabled">
                                <span className="feature-icon">○</span> Priority processing
                            </li>
                            <li className="feature-item disabled">
                                <span className="feature-icon">○</span> Advanced Elastic Match
                            </li>
                        </ul>
                        <Button variant="secondary" disabled>
                            Currently Active
                        </Button>
                    </Card>

                    {/* Athlete Tier */}
                    <Card className="pricing-card pro">
                        <div className="tier-name">Athlete</div>
                        <div className="tier-price">£5<span>/mo</span></div>
                        <ul className="feature-list">
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> <strong>Unlimited</strong> Syncs
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> <strong>Unlimited</strong> Connections
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Priority processing
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> All Advanced Enrichers
                            </li>
                            <li className="feature-item">
                                <span className="feature-icon">✓</span> Custom Sync Scheduling
                            </li>
                        </ul>
                        <Button
                            variant="primary"
                            className="checkout-btn"
                            onClick={handleCheckout}
                            disabled={processing}
                        >
                            {processing ? 'Connecting to Stripe...' : 'Upgrade to Athlete'}
                        </Button>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default SubscriptionPage;
