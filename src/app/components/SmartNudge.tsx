import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartNudges, ActiveNudge } from '../hooks/useSmartNudges';
import { NudgePage } from '../data/smartNudges';
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
    <div className="smart-nudge" role="status" aria-live="polite">
        <span className="smart-nudge__icon">{nudge.icon}</span>
        <div className="smart-nudge__body">
            <p className="smart-nudge__title">{nudge.title}</p>
            <p className="smart-nudge__description">{nudge.description}</p>
        </div>
        <div className="smart-nudge__actions">
            <button
                className="smart-nudge__cta"
                onClick={() => onNavigate(nudge.route)}
            >
                {nudge.cta} →
            </button>
            <button
                className="smart-nudge__dismiss"
                onClick={nudge.dismiss}
                aria-label="Dismiss suggestion"
                title="Dismiss"
            >
                ✕
            </button>
        </div>
    </div>
);

export default SmartNudge;
