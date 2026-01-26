import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heading, Paragraph, Button, Card, Badge } from '../library/ui';
import { Stack } from '../library/layout';
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

    const stepCompletion = [hasConnections, hasPipelines, hasSyncs];

    return (
        <Card>
            <Stack gap="lg">
                <Stack direction="horizontal" justify="between" align="start">
                    <Stack direction="horizontal" gap="md" align="center">
                        <Paragraph inline>👋</Paragraph>
                        <Stack gap="xs">
                            <Heading level={2}>
                                Welcome to <Paragraph inline bold>Fit</Paragraph><Paragraph inline bold>Glue</Paragraph>!
                            </Heading>
                            <Paragraph>Let&apos;s get you set up in 3 easy steps</Paragraph>
                        </Stack>
                    </Stack>
                    {onDismiss && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={onDismiss}
                            aria-label="Dismiss"
                        >
                            ✕
                        </Button>
                    )}
                </Stack>

                <Stack gap="sm">
                    {STEPS.map((step, index) => {
                        const isCompleted = stepCompletion[index];
                        return (
                            <Card
                                key={step.number}
                                variant={isCompleted ? 'default' : 'elevated'}
                                onClick={!isCompleted ? () => navigate(step.route) : undefined}
                            >
                                <Stack direction="horizontal" align="center" justify="between">
                                    <Stack direction="horizontal" gap="md" align="center">
                                        <Badge variant={isCompleted ? 'success' : 'default'} size="sm">
                                            {isCompleted ? '✓' : step.number}
                                        </Badge>
                                        <Paragraph inline>{step.icon}</Paragraph>
                                        <Stack gap="xs">
                                            <Heading level={4}>{isCompleted ? step.completedTitle : step.title}</Heading>
                                            <Paragraph size="sm" muted>{isCompleted ? step.completedDescription : step.description}</Paragraph>
                                        </Stack>
                                    </Stack>
                                    {isCompleted ? (
                                        <Badge variant="success" size="sm">Done</Badge>
                                    ) : (
                                        <Button variant="primary" size="small">
                                            {step.buttonText} →
                                        </Button>
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            </Stack>
        </Card>
    );
};
