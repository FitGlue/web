import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '../library/layout';
import { Card, Heading, Paragraph, Button, Badge } from '../library/ui';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { TourTarget } from './TourTarget';
import './WelcomeBanner.css';

interface WelcomeBannerProps {
    hasConnections?: boolean;
    hasPipelines?: boolean;
    hasSyncs?: boolean;
    isAthlete?: boolean;
    hasShowcaseProfile?: boolean;
    onDismiss?: () => void;
    onStartTour?: () => void;
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
    tourId: string;
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
        tourId: 'step-connections',
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
        tourId: 'step-pipeline',
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
        tourId: 'step-magic',
    },
];

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    hasConnections = false,
    hasPipelines = false,
    hasSyncs = false,
    isAthlete = false,
    hasShowcaseProfile = false,
    onDismiss,
    onStartTour,
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
            tourId: 'step-showcase',
        });
        stepCompletion.push(hasShowcaseProfile);
    }

    const stepCount = allSteps.length;

    return (
        <Card className="welcome-banner">
            <Stack className="welcome-header" direction="horizontal" align="center" justify="between">
                <Stack className="welcome-header-content" direction="horizontal" align="center" gap="sm">
                    <Paragraph inline className="welcome-icon">👋</Paragraph>
                    <Stack className="welcome-text" gap="xs">
                        <Heading level={2}>
                            Welcome to FitGlue!
                        </Heading>
                        <Paragraph>Let&apos;s get you set up in {stepCount} easy steps</Paragraph>
                    </Stack>
                </Stack>
                <Stack className="welcome-header-actions" direction="horizontal" gap="xs">
                    {onStartTour && (
                        <Button
                            className="tour-btn"
                            variant="secondary"
                            size="small"
                            onClick={onStartTour}
                        >
                            🗺️ Take a Tour
                        </Button>
                    )}
                    {canInstall && (
                        <Button
                            className="install-app-btn"
                            variant="secondary"
                            size="small"
                            onClick={promptInstall}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Install App
                        </Button>
                    )}
                    {onDismiss && (
                        <Button
                            className="dismiss-btn"
                            variant="text"
                            size="small"
                            onClick={onDismiss}
                            aria-label="Dismiss"
                        >
                            ✕
                        </Button>
                    )}
                </Stack>
            </Stack>

            <Stack className="onboarding-steps" gap="sm">
                {allSteps.map((step, index) => {
                    const isCompleted = stepCompletion[index];
                    return (
                        <TourTarget key={step.number} id={step.tourId}>
                            <Button
                                className={`step-card ${isCompleted ? 'completed' : ''}`}
                                style={{ '--step-index': index } as React.CSSProperties}
                                onClick={!isCompleted ? () => navigate(step.route) : undefined}
                                disabled={isCompleted}
                                variant="text"
                            >
                                <Badge className={`step-number ${isCompleted ? 'completed' : ''}`}>
                                    {isCompleted ? '✓' : step.number}
                                </Badge>
                                <Stack className="step-content" direction="horizontal" gap="sm" align="center">
                                    <Paragraph inline className="step-icon">{step.icon}</Paragraph>
                                    <Stack className="step-info" gap="xs">
                                        <Heading level={4}>{isCompleted ? step.completedTitle : step.title}</Heading>
                                        <Paragraph>{isCompleted ? step.completedDescription : step.description}</Paragraph>
                                    </Stack>
                                </Stack>
                                <Stack className="step-action">
                                    {isCompleted ? (
                                        <Badge className="step-complete-badge">Done</Badge>
                                    ) : (
                                        <Paragraph inline className="step-cta">
                                            {step.buttonText}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </Paragraph>
                                    )}
                                </Stack>
                            </Button>
                        </TourTarget>
                    );
                })}
            </Stack>
        </Card>
    );
};
