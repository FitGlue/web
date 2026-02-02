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
            Object.keys(userData.integrations).forEach(key => {
                const integration = userData.integrations[key];
                // Map to IntegrationStatus shape from OpenAPI schema
                // Firestore uses 'enabled', schema uses 'connected' - support both
                const status: IntegrationStatus = {
                    connected: integration.enabled ?? integration.connected ?? false,
                    externalUserId: integration.external_user_id || integration.externalUserId || integration.user_id || integration.fitbit_user_id,
                    lastUsedAt: integration.last_used_at || integration.lastUsedAt
                };
                integrationsSummary[key as keyof IntegrationsSummary] = status;
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
