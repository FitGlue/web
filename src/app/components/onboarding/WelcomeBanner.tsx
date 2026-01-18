import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import './WelcomeBanner.css';

interface WelcomeBannerProps {
    hasConnections?: boolean;
    hasPipelines?: boolean;
    hasSyncs?: boolean;
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
    onDismiss
}) => {
    const navigate = useNavigate();

    // Determine which steps are completed
    const stepCompletion = [hasConnections, hasPipelines, hasSyncs];

    return (
        <Card className="welcome-banner">
            <div className="welcome-header">
                <div className="welcome-header-content">
                    <div className="welcome-icon">👋</div>
                    <div className="welcome-text">
                        <h2>
                            Welcome to{' '}
                            <span className="brand">
                                <span className="fit">Fit</span>
                                <span className="glue">Glue</span>
                            </span>
                            !
                        </h2>
                        <p>Let&apos;s get you set up in 3 easy steps</p>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        className="dismiss-btn"
                        onClick={onDismiss}
                        aria-label="Dismiss"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="M12 4L4 12M4 4l8 8" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="onboarding-steps">
                {STEPS.map((step, index) => {
                    const isCompleted = stepCompletion[index];
                    return (
                        <button
                            key={step.number}
                            className={`step-card ${isCompleted ? 'completed' : ''}`}
                            onClick={() => !isCompleted && navigate(step.route)}
                            style={{ '--step-index': index } as React.CSSProperties}
                            disabled={isCompleted}
                        >
                            <div className={`step-number ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted ? '✓' : step.number}
                            </div>
                            <div className="step-content">
                                <div className="step-icon">{step.icon}</div>
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
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M6 12l4-4-4-4" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
};
