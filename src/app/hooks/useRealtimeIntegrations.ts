import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { doc } from 'firebase/firestore';
import { useFirestoreDocument } from './useFirestoreListener';
import {
    integrationsAtom,
    integrationsLastUpdatedAtom,
    isLoadingIntegrationsAtom,
    isIntegrationsLoadedAtom,
    IntegrationsSummary,
    IntegrationStatus
} from '../state/integrationsState';

// Helper to convert Firestore Timestamp to ISO string
const toISOString = (value: unknown): string | undefined => {
    if (!value) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any;
    // Firestore Timestamp has toDate() method
    if (v.toDate && typeof v.toDate === 'function') {
        return v.toDate().toISOString();
    }
    // Already a Date object
    if (v instanceof Date) {
        return v.toISOString();
    }
    // Firestore Timestamp as plain object with seconds/nanoseconds
    if (typeof v.seconds === 'number') {
        return new Date(v.seconds * 1000).toISOString();
    }
    // Already an ISO string
    if (typeof v === 'string') {
        return v;
    }
    return undefined;
};

// Check if a value looks like a Firestore Timestamp
const isTimestamp = (value: unknown): boolean => {
    if (!value) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any;
    return (
        (v.toDate && typeof v.toDate === 'function') ||
        v instanceof Date ||
        typeof v.seconds === 'number'
    );
};

// Fields that should never be exposed (OAuth system-managed tokens)
const OAUTH_SENSITIVE_FIELDS = new Set([
    'access_token', 'accessToken',
    'refresh_token', 'refreshToken',
    'expires_at', 'expiresAt',
    'token', 'secret', 'password', 'credential'
]);

// Fields that are user-provided or user-facing (should be shown)
// - api_key: User entered this themselves (e.g., Hevy)
// - ingress_key/webhook_key: We give this to the user to configure their source
const USER_FACING_CREDENTIAL_FIELDS = new Set([
    'api_key', 'apiKey',
    'ingress_key', 'ingressKey',
    'webhook_key', 'webhookKey',
    'webhook_url', 'webhookUrl'
]);

// Fields that indicate connection status
const CONNECTION_FIELDS = new Set(['enabled', 'connected']);

// Fields that indicate last used timestamp
const LAST_USED_FIELDS = new Set(['last_used_at', 'lastUsedAt', 'last_synced_at', 'lastSyncedAt']);

// Fields that indicate creation timestamp (not useful to display)
const CREATED_FIELDS = new Set(['created_at', 'createdAt']);

// Check if a field name looks like an external user ID
const isExternalIdField = (key: string): boolean => {
    const lower = key.toLowerCase();
    // Match patterns like: user_id, userId, athlete_id, athleteId, fitbit_user_id, etc.
    return (
        (lower.includes('user') && lower.includes('id')) ||
        (lower.includes('athlete') && lower.includes('id')) ||
        lower === 'external_user_id' ||
        lower === 'externaluserid'
    );
};

// Convert field name to display label (snake_case or camelCase to Title Case)
const fieldToLabel = (key: string): string => {
    // Handle snake_case
    let result = key.replace(/_/g, ' ');
    // Handle camelCase
    result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Title case
    return result
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * useRealtimeIntegrations - Firebase SDK Real-time Hook
 *
 * Listens to the user document's `integrations` field via onSnapshot.
 * Uses the shared useFirestoreDocument for common functionality.
 *
 * Architecture: Firebase SDK for reads, REST for mutations only.
 */
export const useRealtimeIntegrations = () => {
    const [integrations, setIntegrations] = useAtom(integrationsAtom);
    const [, setLastUpdated] = useAtom(integrationsLastUpdatedAtom);
    const [, setLoading] = useAtom(isLoadingIntegrationsAtom);
    const [, setLoaded] = useAtom(isIntegrationsLoadedAtom);

    const docFactory = useCallback(
        (firestore: ReturnType<typeof import('../../shared/firebase').getFirebaseFirestore>, userId: string) => {
            if (!firestore) return null;
            return doc(firestore, 'users', userId);
        },
        []
    );

    const mapper = useCallback((data: unknown | undefined): IntegrationsSummary | null => {
        if (!data) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData = data as any;
        const integrationsSummary: IntegrationsSummary = {};

        if (userData.integrations) {
            Object.keys(userData.integrations).forEach(integrationKey => {
                const integration = userData.integrations[integrationKey];
                if (!integration || typeof integration !== 'object') return;

                let connected = false;
                let externalUserId: string | undefined;
                let lastUsedAt: string | undefined;
                const additionalDetails: Record<string, string> = {};

                // Iterate through all fields and intelligently categorize them
                Object.entries(integration).forEach(([fieldKey, value]) => {
                    // Skip null/undefined values
                    if (value === null || value === undefined) return;

                    // Skip OAuth system-managed tokens (never show these)
                    if (OAUTH_SENSITIVE_FIELDS.has(fieldKey)) return;

                    // User-facing credentials should be shown (e.g., API key user provided, ingress key we gave them)
                    if (USER_FACING_CREDENTIAL_FIELDS.has(fieldKey)) {
                        additionalDetails[fieldToLabel(fieldKey)] = String(value);
                        return;
                    }

                    // Check for connection status
                    if (CONNECTION_FIELDS.has(fieldKey)) {
                        connected = Boolean(value);
                        return;
                    }

                    // Check for last used timestamp
                    if (LAST_USED_FIELDS.has(fieldKey)) {
                        lastUsedAt = toISOString(value);
                        return;
                    }

                    // Skip created_at fields (not useful to display)
                    if (CREATED_FIELDS.has(fieldKey)) return;

                    // Check for external user ID
                    if (isExternalIdField(fieldKey)) {
                        externalUserId = String(value);
                        return;
                    }

                    // Skip any remaining timestamp fields
                    if (isTimestamp(value)) return;

                    // Add remaining non-sensitive string/number/boolean fields to additional details
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        additionalDetails[fieldToLabel(fieldKey)] = String(value);
                    }
                });

                const status: IntegrationStatus = {
                    connected,
                    externalUserId,
                    lastUsedAt,
                    additionalDetails: Object.keys(additionalDetails).length > 0 ? additionalDetails : undefined
                };
                integrationsSummary[integrationKey as keyof IntegrationsSummary] = status;
            });
        }

        return integrationsSummary;
    }, []);

    const handleData = useCallback((data: IntegrationsSummary | null) => {
        setIntegrations(data);
        setLastUpdated(new Date());
        setLoaded(true);
        setLoading(false);
    }, [setIntegrations, setLastUpdated, setLoaded, setLoading]);

    const { loading, error, isListening, refresh } = useFirestoreDocument({
        listenerKey: 'user_integrations',
        docFactory,
        mapper,
        onData: handleData,
    });

    return {
        integrations,
        loading,
        isListening,
        error,
        refresh
    };
};
