import React, { useId } from 'react';
import './CountdownRing.css';

export interface CountdownRingProps {
    deadline?: Date | null;
    createdAt?: Date | null;
    size?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 42;

function getTimeDisplay(deadline: Date): { n: string; u: string; urgent: boolean } {
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return { n: '!', u: 'OVERDUE', urgent: true };
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return { n: String(minutes), u: 'MIN LEFT', urgent: true };
    if (hours < 24) {
        const m = Math.floor((diff % 3600000) / 60000);
        return { n: `${hours}:${String(m).padStart(2, '0')}`, u: 'HRS LEFT', urgent: false };
    }
    return { n: String(days), u: 'DAYS LEFT', urgent: false };
}

function getFraction(deadline: Date, createdAt?: Date | null): number {
    const now = Date.now();
    const end = deadline.getTime();
    const start = createdAt ? createdAt.getTime() : end - 24 * 3600 * 1000;
    const total = end - start;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(1, (end - now) / total));
}

export const CountdownRing: React.FC<CountdownRingProps> = ({ deadline, createdAt, size = 80 }) => {
    const uid = useId();
    const gradId = `aurora-${uid.replace(/:/g, '')}`;

    if (!deadline) {
        return (
            <div className="countdown-ring" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                    <circle className="countdown-ring__bg" cx="50" cy="50" r="42" />
                </svg>
                <div className="countdown-ring__label">
                    <div className="countdown-ring__n">∞</div>
                    <div className="countdown-ring__u">NO DEADLINE</div>
                </div>
            </div>
        );
    }

    const { n, u, urgent } = getTimeDisplay(deadline);
    const fraction = getFraction(deadline, createdAt);
    const dashOffset = CIRCUMFERENCE * (1 - fraction);

    return (
        <div className="countdown-ring" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                {!urgent && (
                    <defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff3da6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                    </defs>
                )}
                <circle className="countdown-ring__bg" cx="50" cy="50" r="42" />
                <circle
                    className={`countdown-ring__fg${urgent ? ' countdown-ring__fg--warn' : ''}`}
                    cx="50" cy="50" r="42"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    stroke={urgent ? undefined : `url(#${gradId})`}
                />
            </svg>
            <div className="countdown-ring__label">
                <div className={`countdown-ring__n${urgent ? ' countdown-ring__n--warn' : ''}`}>{n}</div>
                <div className="countdown-ring__u">{u}</div>
            </div>
        </div>
    );
};
