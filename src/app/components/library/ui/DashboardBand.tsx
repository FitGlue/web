import React, { ReactNode } from 'react';
import './DashboardBand.css';

export interface DashboardBandProps {
    label: ReactNode;
    right?: ReactNode;
    tone?: 'ink' | 'aurora';
}

export const DashboardBand: React.FC<DashboardBandProps> = ({ label, right, tone = 'ink' }) => (
    <div className={`dash-band dash-band--${tone}`}>
        <span className="dash-band__label">{label}</span>
        {right && <span className="dash-band__right">{right}</span>}
    </div>
);
