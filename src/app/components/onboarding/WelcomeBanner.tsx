import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import './WelcomeBanner.css';

interface WelcomeBannerProps {
    hasConnections?: boolean;
    hasPipelines?: boolean;
    hasSyncs?: boolean;
    isAthlete?: boolean;
    hasShowcaseProfile?: boolean;
    onDismiss?: () => void;
}

interface StepConfig {
    number: number;
    title: string;
    completedTitle: string;
    description: string;
    completedDescription: string;
    buttonText: string;
    icon: string;
    route: string;
}

const STEPS: StepConfig[] = [
    {
        number: 1,
        title: 'Add some Connections',
        completedTitle: 'Connections configured',
        description: 'Link your workout apps — sources in, targets out',
        completedDescription: 'Your apps are linked and ready',
        buttonText: 'Connect',
        icon: '🔗',
        route: '/settings/integrations',
    },
    {
        number: 2,
        title: 'Create a Pipeline',
        completedTitle: 'Pipeline created',
        description: 'Pick your Boosters and configure the flow',
        completedDescription: 'Your enhancement flow is set up',
        buttonText: 'Create',
        icon: '⚡',
        route: '/settings/pipelines/new',
    },
    {
        number: 3,
        title: 'Watch the magic happen',
        completedTitle: 'Activities syncing',
        description: 'Your activities get boosted and synced automatically',
        completedDescription: 'Your activities are being enhanced',
        buttonText: 'Activities',
        icon: '✨',
        route: '/activities',
    },
];

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    hasConnections = false,
    hasPipelines = false,
    hasSyncs = false,
    isAthlete = false,
    hasShowcaseProfile = false,
    onDismiss
}) => {
    const navigate = useNavigate();
    const { canInstall, promptInstall } = usePWAInstall();

    const allSteps: StepConfig[] = [...STEPS];
    const stepCompletion = [hasConnections, hasPipelines, hasSyncs];

    if (isAthlete) {
        allSteps.push({
            number: 4,
            title: 'Set up your Showcase',
            completedTitle: 'Showcase profile ready',
            description: 'Personalise your public athlete profile',
            completedDescription: 'Your showcase profile is set up',
            buttonText: 'Manage',
            icon: '🏆',
            route: '/settings/showcase',
        });
        stepCompletion.push(hasShowcaseProfile);
    }

    const stepCount = allSteps.length;

    return (
        <div className="welcome-banner">
            <div className="welcome-header">
                <div className="welcome-header-content">
                    <span className="welcome-icon">👋</span>
                    <div className="welcome-text">
                        <h2>
                            Welcome to <span className="brand"><span className="fit">Fit</span><span className="glue">Glue</span></span>!
                        </h2>
                        <p>Let&apos;s get you set up in {stepCount} easy steps</p>
                    </div>
                </div>
                <div className="welcome-header-actions">
                    {canInstall && (
                        <button
                            className="install-app-btn"
                            onClick={promptInstall}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Install App
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            className="dismiss-btn"
                            onClick={onDismiss}
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="onboarding-steps">
                {allSteps.map((step, index) => {
                    const isCompleted = stepCompletion[index];
                    return (
                        <button
                            key={step.number}
                            className={`step-card ${isCompleted ? 'completed' : ''}`}
                            style={{ '--step-index': index } as React.CSSProperties}
                            onClick={!isCompleted ? () => navigate(step.route) : undefined}
                            disabled={isCompleted}
                        >
                            <div className={`step-number ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted ? '✓' : step.number}
                            </div>
                            <div className="step-content">
                                <span className="step-icon">{step.icon}</span>
                                <div className="step-info">
                                    <h4>{isCompleted ? step.completedTitle : step.title}</h4>
                                    <p>{isCompleted ? step.completedDescription : step.description}</p>
                                </div>
                            </div>
                            <div className="step-action">
                                {isCompleted ? (
                                    <span className="step-complete-badge">Done</span>
                                ) : (
                                    <span className="step-cta">
                                        {step.buttonText}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
