import { useSyncExternalStore } from 'react';

/**
 * Global Firestore connection state.
 *
 * The app reads all data through Firestore real-time listeners
 * (see {@link useFirestoreListener}). On a flaky or absent connection, Firestore
 * serves the first snapshot straight from its local cache — which, on a cold
 * load, is empty. Pages then render "no pipelines" / "no connections" empty
 * states even though the data simply hasn't arrived from the server yet.
 *
 * Rather than teach every page to distinguish "still connecting" from "genuinely
 * empty", we track connection state in one place. Every listener reports whether
 * its latest snapshot came from the server or from cache, and we derive a single
 * status the whole app can surface via a banner.
 *
 * Status meanings:
 * - `connecting` — we have active listeners but at least one is still waiting on,
 *   or serving stale cache instead of, server-confirmed data.
 * - `connected`  — every active listener is in sync with the server (or there are
 *   none, so there is nothing to wait on).
 * - `offline`    — the browser reports no network connection.
 */
export type FirestoreConnectionStatus = 'connecting' | 'connected' | 'offline';

type EntryState = 'pending' | 'cache' | 'server' | 'error';

// Latest per-listener state, keyed by the listener's full registry key.
const entries = new Map<string, EntryState>();
const subscribers = new Set<() => void>();

let online = typeof navigator === 'undefined' ? true : navigator.onLine;

function deriveStatus(): FirestoreConnectionStatus {
    if (!online) return 'offline';
    for (const state of entries.values()) {
        // Errors are query-specific (e.g. permission denied), not a sign of a
        // connectivity problem, so they don't hold us in "connecting".
        if (state === 'pending' || state === 'cache') {
            return 'connecting';
        }
    }
    return 'connected';
}

let cachedStatus: FirestoreConnectionStatus = deriveStatus();

function emit(): void {
    const next = deriveStatus();
    if (next === cachedStatus) return;
    cachedStatus = next;
    subscribers.forEach((cb) => cb());
}

/** A listener has been created and is awaiting its first snapshot. */
export function reportFirestoreListenerAdded(key: string): void {
    if (entries.get(key) !== 'pending') {
        entries.set(key, 'pending');
        emit();
    }
}

/** A listener received a snapshot; `fromCache` tells us if it's server-confirmed. */
export function reportFirestoreSnapshot(key: string, fromCache: boolean): void {
    entries.set(key, fromCache ? 'cache' : 'server');
    emit();
}

/** A listener errored (treated as query-specific, not a connectivity drop). */
export function reportFirestoreError(key: string): void {
    entries.set(key, 'error');
    emit();
}

/** A listener was fully torn down (no remaining subscribers). */
export function reportFirestoreListenerRemoved(key: string): void {
    if (entries.delete(key)) emit();
}

function setOnline(value: boolean): void {
    if (online === value) return;
    online = value;
    emit();
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
}

function subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    return () => {
        subscribers.delete(cb);
    };
}

function getSnapshot(): FirestoreConnectionStatus {
    return cachedStatus;
}

/**
 * Subscribe to the global Firestore connection status. Re-renders only when the
 * derived status actually changes.
 */
export function useFirestoreConnection(): FirestoreConnectionStatus {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Test-only: reset module state between cases. */
export function __resetFirestoreConnection(): void {
    entries.clear();
    online = typeof navigator === 'undefined' ? true : navigator.onLine;
    cachedStatus = deriveStatus();
}
