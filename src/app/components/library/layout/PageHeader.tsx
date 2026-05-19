import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderProps {
    title?: string | ReactNode;
    actions?: ReactNode;
    backTo?: string;
    backLabel?: string;
    /** Mono text shown on the right side of the gradient band (e.g. breadcrumb) */
    eyebrow?: string;
    /** Optional subtitle shown below the title in mono style */
    subtitle?: string;
    /** Optional inline stats group aligned to the right of the title row */
    stats?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actions, backTo, backLabel, eyebrow, subtitle, stats }) => {
    // Derive eyebrow from backLabel when not explicitly provided
    const bandRight = eyebrow || (backLabel ? backLabel.toUpperCase() : undefined);

    return (
        <div className="page-header">
            {/* Gradient band strip */}
            <div className="page-header__band">
                <span className="page-header__eyebrow">
                    {typeof title === 'string' ? title.toUpperCase() : 'FITGLUE'}
                </span>
                {bandRight && (
                    <span style={{ fontFamily: 'var(--fg-font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', opacity: 0.85 }}>
                        {bandRight}
                    </span>
                )}
            </div>

            {/* Title + actions row */}
            <div className="page-header__body">
                <div className="page-header-left">
                    {backTo && (
                        <Link to={backTo} className="back-link">
                            ← {backLabel || 'Back'}
                        </Link>
                    )}
                    <div className="page-header-title">
                        {typeof title === 'string' ? <h2>{title}</h2> : title}
                    </div>
                    {subtitle && (
                        <p className="page-header-subtitle">{subtitle}</p>
                    )}
                </div>
                <div className="page-header-actions">
                    {stats && <div className="page-header-stats">{stats}</div>}
                    {actions}
                </div>
            </div>
        </div>
    );
};
