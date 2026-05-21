import React, { ReactNode } from 'react';
import './DashboardHeading.css';

export interface DashboardStat {
    n: ReactNode;
    l: string;
    tone?: 'gradient';
}

export interface DashboardHeadingProps {
    eyebrow: string;
    title: ReactNode;
    stats: DashboardStat[];
}

/** Gradient-coloured inline span — use inside DashboardHeading title */
export const Gr: React.FC<{ children: ReactNode }> = ({ children }) => (
    <span className="dash-heading__gr">{children}</span>
);

export const DashboardHeading: React.FC<DashboardHeadingProps> = ({ eyebrow, title, stats }) => (
    <div className="dash-heading">
        <div className="dash-heading__left">
            <div className="dash-heading__eyebrow">{eyebrow}</div>
            <h2 className="dash-heading__title">{title}</h2>
        </div>
        {stats.length > 0 && (
            <div className="dash-heading__stats">
                {stats.map((stat, i) => (
                    <div key={i} className="dash-istat">
                        <span className={`dash-istat__n${stat.tone === 'gradient' ? ' dash-istat__n--gr' : ''}`}>
                            {stat.n}
                        </span>
                        <span className="dash-istat__l">{stat.l}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);
