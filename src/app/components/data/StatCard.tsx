import React from 'react';
import './StatCard.css';

interface StatCardProps {
    title: string;
    value: string | number;
    label: string;
    onClick?: () => void;
    loading?: boolean;
}

/**
 * StatCard — Brutal × Aurora reskin
 * ink-2 surface, large mono value in aurora-cyan, small mono label
 */
export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    label,
    onClick,
    loading = false,
}) => {
    return (
        <div
            className={`ba-stat-card${onClick ? ' ba-stat-card--clickable' : ''}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            <div className="ba-stat-card__title">{title}</div>
            <div className={`ba-stat-card__value${loading ? ' ba-stat-card__value--loading' : ''}`}>
                {loading ? '...' : value}
            </div>
            <div className="ba-stat-card__label">{label}</div>
        </div>
    );
};
