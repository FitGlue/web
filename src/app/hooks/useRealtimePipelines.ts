import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { collection, query } from 'firebase/firestore';
import { useFirestoreListener } from './useFirestoreListener';
import {
    pipelinesAtom,
    pipelinesLastUpdatedAtom,
    isLoadingPipelinesAtom,
    isPipelinesLoadedAtom,
    PipelineConfig
} from '../state/pipelinesState';

/**
 * useRealtimePipelines - Firebase SDK Real-time Hook
 *
 * Listens to `users/{userId}/pipelines` via onSnapshot.
 * Uses the shared useFirestoreListener for common functionality.
 * 
 * Architecture: Firebase SDK for reads, REST for mutations only.
 */
export const useRealtimePipelines = () => {
    const [pipelines, setPipelines] = useAtom(pipelinesAtom);
    const [, setLastUpdated] = useAtom(pipelinesLastUpdatedAtom);
    const [, setLoading] = useAtom(isLoadingPipelinesAtom);
    const [, setLoaded] = useAtom(isPipelinesLoadedAtom);

    const queryFactory = useCallback(
        (firestore: ReturnType<typeof import('../../shared/firebase').getFirebaseFirestore>, userId: string) => {
            if (!firestore) return null;
            const pipelinesRef = collection(firestore, 'users', userId, 'pipelines');
            return query(pipelinesRef);
        },
        []
    );

    const mapper = useCallback((snapshot: unknown): PipelineConfig[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const querySnapshot = snapshot as any;
        return querySnapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '',
                source: data.source,
                destinations: data.destinations || [],
                enrichers: (Array.isArray(data.enrichers) ? data.enrichers : []).map((e: Record<string, unknown>) => ({
                    providerType: (e.provider_type || e.providerType) as number,
                    typedConfig: (e.typed_config || e.typedConfig || {}) as Record<string, string>
                })),
                disabled: data.disabled || false
            };
        });
    }, []);

    const handleData = useCallback((data: PipelineConfig[]) => {
        setPipelines(data);
        setLastUpdated(new Date());
        setLoaded(true);
        setLoading(false);
    }, [setPipelines, setLastUpdated, setLoaded, setLoading]);

    const { loading, error, isListening, refresh } = useFirestoreListener({
        queryFactory,
        mapper,
        onData: handleData,
    });

    return {
        pipelines,
        loading,
        isListening,
        error,
        refresh
    };
};
