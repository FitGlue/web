import React from 'react';
import { UnsynchronizedEntry } from '../../services/ActivitiesService';
import { formatActivityType, formatActivitySource } from '../../../types/pb/enum-formatters';
import { Badge } from '../library/ui/Badge';

interface UnsyncedActivityCardProps {
    entry: UnsynchronizedEntry;
    onClick?: () => void;
}

const formatSourceName = (source?: string): string => {
    return formatActivitySource(source);
};

/** Status → badge variant + label */
const getStatusStamp = (status?: string): { variant: 'error' | 'warning'; label: string } => {
    const s = status?.toUpperCase() || '';
    if (s === 'FAILED') return { variant: 'error', label: '✕ FAILED' };
    return { variant: 'warning', label: status?.replace(/_/g, ' ').toUpperCase() || 'PENDING' };
};

/**
 * UnsyncedActivityCard — Brutal × Aurora reskin
 * Same card structure as EnrichedActivityCard but with rose/amber tint on status strip
 */
export const UnsyncedActivityCard: React.FC<UnsyncedActivityCardProps> = ({
    entry,
    onClick,
}) => {
    const activityTitle = entry.title || 'Unknown Activity';
    const activityType = formatActivityType(entry.activityType);
    const sourceName = formatSourceName(entry.source);
    const stamp = getStatusStamp(entry.status);

    const attemptDate = entry.timestamp
        ? new Date(entry.timestamp).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : null;

    const isFailed = entry.status === 'FAILED';

    return (
        <div
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
            style={{
                background: 'var(--fg-ink-2)',
                boxShadow: isFailed
                    ? 'inset 3px 0 0 var(--fg-rose), inset 0 0 0 1px var(--fg-hairline-color)'
                    : 'inset 3px 0 0 var(--fg-gold), inset 0 0 0 1px var(--fg-hairline-color)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={onClick ? (e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--fg-ink-3)';
            } : undefined}
            onMouseLeave={onClick ? (e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--fg-ink-2)';
            } : undefined}
        >
            {/* Header strip — status + type + title + date */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.4375rem 0.875rem',
                background: 'var(--fg-ink-3)',
                borderBottom: 'var(--fg-rule-thin)',
                flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                    {/* Activity type badge */}
                    <Badge>{activityType}</Badge>
                    {/* Title — display font */}
                    <span style={{
                        fontFamily: 'var(--fg-font-display)',
                        fontSize: '0.9375rem',
                        letterSpacing: '-0.005em',
                        textTransform: 'uppercase',
                        color: 'var(--fg-paper)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '380px',
                    }}>
                        {activityTitle}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {/* Status badge */}
                    <Badge variant={stamp.variant}>{stamp.label}</Badge>
                    {/* Date mono */}
                    {attemptDate && (
                        <span style={{
                            fontFamily: 'var(--fg-font-mono)',
                            fontSize: '0.625rem',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--fg-paper-dim)',
                        }}>
                            {attemptDate}
                        </span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '0.75rem 0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                        fontFamily: 'var(--fg-font-mono)',
                        fontSize: '0.625rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--fg-paper-dim)',
                    }}>
                        📥 FROM {sourceName}
                    </span>
                    {entry.errorMessage && (
                        <>
                            <span style={{ color: 'var(--fg-hairline-color)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem' }}>·</span>
                            <span style={{
                                fontFamily: 'var(--fg-font-mono)',
                                fontSize: '0.625rem',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: 'var(--fg-rose)',
                            }}>
                                {entry.errorMessage}
                            </span>
                        </>
                    )}
                    <span style={{ color: 'var(--fg-hairline-color)', fontFamily: 'var(--fg-font-mono)', fontSize: '0.625rem' }}>·</span>
                    <span style={{
                        fontFamily: 'var(--fg-font-mono)',
                        fontSize: '0.625rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--fg-cyan)',
                    }}>
                        View details →
                    </span>
                </div>
            </div>
        </div>
    );
};
