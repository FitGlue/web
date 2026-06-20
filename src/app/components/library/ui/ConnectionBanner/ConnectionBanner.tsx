import React, { useEffect, useRef, useState } from 'react';
import { useFirestoreConnection } from '../../../../hooks/useFirestoreConnection';
import './ConnectionBanner.css';

// Wait this long before showing a "connecting"/"offline" banner. Fast loads
// resolve well within this window, so the banner never flashes on a healthy
// connection — it only appears when sync is genuinely slow or absent.
const SHOW_DELAY_MS = 700;
// How long to keep the reassuring "Connected" banner up after recovery.
const CONNECTED_MS = 2000;

type Phase = 'hidden' | 'connecting' | 'offline' | 'connected';

const PHASE_CONFIG: Record<Exclude<Phase, 'hidden'>, { icon: string; label: string; message?: string }> = {
    connecting: { icon: '◴', label: 'Connecting…', message: 'Syncing your latest data' },
    offline: { icon: '⚠', label: "You're offline", message: 'Showing your last saved data' },
    connected: { icon: '✓', label: 'Connected' },
};

/**
 * A small fixed banner that surfaces the global Firestore connection state.
 *
 * It reads {@link useFirestoreConnection} and, after a short debounce, shows
 * "Connecting…" (or "You're offline") while data is still syncing, then a brief
 * "Connected" once everything is in sync. This reassures the user that an empty
 * page is loading rather than truly empty, without touching every page that
 * renders Firestore data.
 */
export const ConnectionBanner: React.FC = () => {
    const status = useFirestoreConnection();
    const [phase, setPhase] = useState<Phase>('hidden');
    const phaseRef = useRef<Phase>('hidden');
    phaseRef.current = phase;

    useEffect(() => {
        if (status === 'connected') {
            // Only celebrate recovery if we were actually showing a problem.
            if (phaseRef.current === 'hidden') return;
            setPhase('connected');
            const timer = setTimeout(() => setPhase('hidden'), CONNECTED_MS);
            return () => clearTimeout(timer);
        }

        // status is 'connecting' or 'offline'
        if (phaseRef.current === 'hidden' || phaseRef.current === 'connected') {
            // Debounce so a quick sync never flashes the banner.
            const timer = setTimeout(() => setPhase(status), SHOW_DELAY_MS);
            return () => clearTimeout(timer);
        }
        // Already visible — switch between connecting/offline immediately.
        setPhase(status);
        return undefined;
    }, [status]);

    if (phase === 'hidden') return null;

    const config = PHASE_CONFIG[phase];

    return (
        <div className={`fg-conn-banner fg-conn-banner--${phase}`} role="status" aria-live="polite">
            <span className="fg-conn-banner__icon" aria-hidden="true">{config.icon}</span>
            <span className="fg-conn-banner__label">{config.label}</span>
            {config.message && <span className="fg-conn-banner__message">{config.message}</span>}
        </div>
    );
};
