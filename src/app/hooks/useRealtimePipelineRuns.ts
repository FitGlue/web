import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useFirestoreListener } from './useFirestoreListener';
import { pipelineRunsAtom } from '../state/activitiesState';
import { getFirebaseFirestore } from '../../shared/firebase';
import { PipelineRun, PipelineRunStatus, DestinationStatus } from '../../types/pb/user';
import { Destination } from '../../types/pb/events';

// Helper to convert Firestore Timestamp to Date
const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any;
    if (v.toDate && typeof v.toDate === 'function') {
        return v.toDate();
    }
    if (v instanceof Date) {
        return v;
    }
    if (typeof v === 'string') {
        return new Date(v);
    }
    return undefined;
};

/**
 * mapFirestoreToPipelineRun - Maps Firestore document data to typed PipelineRun
 *
 * Handles snake_case field names from Firestore storage.
 */
const mapFirestoreToPipelineRun = (docId: string, data: Record<string, unknown>): PipelineRun => {
    // Map boosters array
    const boosters = ((data.boosters || []) as Array<Record<string, unknown>>).map(b => ({
        providerName: (b.provider_name || b.providerName) as string,
        status: b.status as string,
        durationMs: (b.duration_ms || b.durationMs || 0) as number,
        metadata: (b.metadata || {}) as Record<string, string>,
        error: b.error as string | undefined,
    }));

    // Map destinations array
    const destinations = ((data.destinations || []) as Array<Record<string, unknown>>).map(d => ({
        destination: (d.destination || 0) as Destination,
        status: (d.status || 0) as DestinationStatus,
        externalId: (d.external_id || d.externalId) as string | undefined,
        error: d.error as string | undefined,
        completedAt: toDate(d.completed_at || d.completedAt),
    }));

    return {
        id: docId,
        pipelineId: (data.pipeline_id || data.pipelineId || '') as string,
        activityId: (data.activity_id || data.activityId || '') as string,
        source: (data.source || '') as string,
        sourceActivityId: (data.source_activity_id || data.sourceActivityId || '') as string,
        title: (data.title || '') as string,
        description: (data.description || '') as string,
        type: (data.type || 0) as number,
        startTime: toDate(data.start_time || data.startTime),
        status: (data.status || PipelineRunStatus.PIPELINE_RUN_STATUS_UNSPECIFIED) as PipelineRunStatus,
        createdAt: toDate(data.created_at || data.createdAt),
        updatedAt: toDate(data.updated_at || data.updatedAt),
        boosters,
        destinations,
        statusMessage: (data.status_message || data.statusMessage) as string | undefined,
        originalPayloadUri: (data.original_payload_uri || data.originalPayloadUri || '') as string,
        enrichedEventUri: (data.enriched_event_uri || data.enrichedEventUri || '') as string,
        pendingInputId: (data.pending_input_id || data.pendingInputId) as string | undefined,
    };
};

/**
 * useRealtimePipelineRuns - Firebase SDK Real-time Hook for PipelineRun documents
 *
 * Listens to `users/{userId}/pipeline_runs` via onSnapshot.
 * Provides booster execution details and destination outcomes in real-time
 * without needing lazy-loaded execution traces.
 *
 * Architecture: This replaces the old pattern of loading SynchronizedActivity +
 * on-demand execution traces with a single unified source of truth.
 */
export const useRealtimePipelineRuns = (initialEnabled = true, runLimit = 10) => {
    const [pipelineRuns, setPipelineRuns] = useAtom(pipelineRunsAtom);

    const queryFactory = useCallback(
        (firestore: ReturnType<typeof getFirebaseFirestore>, userId: string) => {
            if (!firestore) return null;
            const runsRef = collection(firestore, 'users', userId, 'pipeline_runs');
            return query(
                runsRef,
                orderBy('created_at', 'desc'),
                limit(runLimit)
            );
        },
        [runLimit]
    );

    const mapper = useCallback((snapshot: unknown): PipelineRun[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const querySnapshot = snapshot as any;
        return querySnapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
            const data = doc.data();
            return mapFirestoreToPipelineRun(doc.id, data);
        });
    }, []);

    const handleData = useCallback((data: PipelineRun[]) => {
        setPipelineRuns(data);
    }, [setPipelineRuns]);

    const { loading, error, isListening, refresh } = useFirestoreListener({
        listenerKey: `pipeline_runs_${runLimit}`,
        queryFactory,
        mapper,
        onData: handleData,
        enabled: initialEnabled,
    });

    return {
        pipelineRuns,
        loading,
        isListening,
        error,
        forceRefresh: refresh,
    };
};

