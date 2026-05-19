import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartNudges, ActiveNudge } from '../hooks/useSmartNudges';
import { NudgePage } from '../data/smartNudges';
import { Card } from './library/ui/Card';
import { Stack } from './library/layout/Stack';
import { Paragraph } from './library/ui/Paragraph';
import { Button } from './library/ui/Button';
import './SmartNudge.css';

interface SmartNudgeProps {
    page: NudgePage;
}

/**
 * SmartNudge — contextual tip that appears on relevant pages.
 *
 * Usage: <SmartNudge page="dashboard" />
 *
 * Drop this into any page and it will automatically evaluate the nudge
 * registry for the best matching nudge. Renders nothing when there's
 * no active nudge.
 */
export const SmartNudge: React.FC<SmartNudgeProps> = ({ page }) => {
    const nudge = useSmartNudges(page);
    const navigate = useNavigate();

    if (!nudge) return null;

    return <SmartNudgeBanner nudge={nudge} onNavigate={(route) => navigate(route)} />;
};

// ── Inner presentational component ──────────────────────────────

interface SmartNudgeBannerProps {
    nudge: ActiveNudge;
    onNavigate: (route: string) => void;
}

const SmartNudgeBanner: React.FC<SmartNudgeBannerProps> = ({ nudge, onNavigate }) => (
    <Card className="smart-nudge" variant="elevated">
        <Stack direction="horizontal" gap="sm" align="center" role="status" aria-live="polite">
            <Paragraph inline className="smart-nudge__icon">{nudge.icon}</Paragraph>
            <Stack gap="xs" className="smart-nudge__body">
                <Paragraph inline size="sm" muted className="smart-nudge__label">Nudge</Paragraph>
                <Paragraph inline bold className="smart-nudge__title">{nudge.title}</Paragraph>
                <Paragraph inline size="sm" className="smart-nudge__description">{nudge.description}</Paragraph>
            </Stack>
            <Stack direction="horizontal" gap="xs" className="smart-nudge__actions">
                <Button
                    variant="primary"
                    size="sm"
                    className="smart-nudge__cta"
                    onClick={() => onNavigate(nudge.route)}
                >
                    {nudge.cta} →
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="smart-nudge__dismiss"
                    onClick={nudge.dismiss}
                    aria-label="Dismiss suggestion"
                    title="Dismiss"
                >
                    ✕
                </Button>
            </Stack>
        </Stack>
    </Card>
);

export default SmartNudge;
