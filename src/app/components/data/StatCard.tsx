import React from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
    /** Card title */
    title: string;
    /** Main stat value */
    value: string | number;
    /** Description label below value */
    label: string;
    /** Click handler */
    onClick?: () => void;
    /** Loading state - shows placeholder */
    loading?: boolean;
}

/**
 * StatCard displays a statistic in a clickable card format.
 * Used for dashboard overview stats.
 */
export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    label,
    onClick,
    loading = false,
}) => {
    return (
        <Card variant="default" onClick={onClick} className="stat-card">
            <h3>{title}</h3>
            <p className="stat-value">{loading ? '...' : value}</p>
            <p className="stat-label">{label}</p>
        </Card>
    );
};
