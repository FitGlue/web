import React from 'react';
import './DashboardPlanBand.css';

export interface DashboardPlanBandProps {
    tier: 'FREE' | 'ATHLETE' | 'PRO';
    credits?: number;
    resetDate?: string;
    onManage?: () => void;
}

const TIER_LABEL: Record<DashboardPlanBandProps['tier'], string> = {
    FREE: 'FREE PLAN · 10 SYNCS / MONTH',
    ATHLETE: 'ATHLETE PLAN · UNLIMITED SYNCS',
    PRO: 'PRO PLAN · UNLIMITED SYNCS',
};

export const DashboardPlanBand: React.FC<DashboardPlanBandProps> = ({
    tier,
    credits,
    resetDate,
    onManage,
}) => (
    <div className="dash-plan-band">
        <div className="dash-plan-band__icon">✦</div>
        <div className="dash-plan-band__title">{TIER_LABEL[tier]}</div>
        {(credits !== undefined || resetDate) && (
            <div className="dash-plan-band__meta">
                {credits !== undefined && `${credits.toLocaleString()} credits`}
                {credits !== undefined && resetDate && ' · '}
                {resetDate && `resets ${resetDate}`}
            </div>
        )}
        <div className="dash-plan-band__spacer" />
        {onManage && (
            <button className="fg-button fg-button--ink fg-button--sm" onClick={onManage}>
                MANAGE →
            </button>
        )}
    </div>
);
