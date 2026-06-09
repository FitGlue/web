import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestoreListener } from './useFirestoreListener';
import {
    pendingInputsAtom,
    inputsLastUpdatedAtom,
    isLoadingInputsAtom,
    isInputsLoadedAtom,
    PendingInput,
    DisplayConfig,
} from '../state/inputsState';
import { PendingInput_Status } from '../../types/pb/models/pipeline/pending_input';

export type { PendingInput, DisplayConfig };

/** Parse well-known display.* keys from provider metadata into a structured object */
function parseDisplayConfig(metadata?: Record<string, string>): DisplayConfig | undefined {
    if (!metadata) return undefined;
    const config: DisplayConfig = {};
    try { if (metadata['display.field_labels']) config.fieldLabels = JSON.parse(metadata['display.field_labels']); } catch { /* ignore */ }
    try { if (metadata['display.field_types']) config.fieldTypes = JSON.parse(metadata['display.field_types']); } catch { /* ignore */ }
    config.summary = metadata['display.summary'];
    config.title = metadata['display.title'];
    config.help = metadata['display.help'];
    return (config.fieldLabels || config.fieldTypes || config.summary || config.title || config.help) ? config : undefined;
}

/** Convert a Firestore Timestamp, Date, or ISO string to a Date object */
const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any;
    if (v.toDate && typeof v.toDate === 'function') return v.toDate() as Date;
    if (v instanceof Date) return v;
    if (typeof v === 'string') { const d = new Date(v); return isNaN(d.getTime()) ? undefined : d; }
    return undefined;
};

/**
 * useRealtimeInputs - Firebase SDK Real-time Hook
 *
 * Listens to `users/{userId}/pending_inputs` via onSnapshot.
 * Uses the shared useFirestoreListener for common functionality.
 *
 * Architecture: Firebase SDK for reads, REST for mutations only.
 * PendingInput is typed from the proto-generated type — keep in sync via `make generate`.
 */
export const useRealtimeInputs = () => {
    const [inputs, setInputs] = useAtom(pendingInputsAtom);
    const [, setLastUpdated] = useAtom(inputsLastUpdatedAtom);
    const [, setLoading] = useAtom(isLoadingInputsAtom);
    const [, setLoaded] = useAtom(isInputsLoadedAtom);

    const queryFactory = useCallback(
        (firestore: ReturnType<typeof import('../../shared/firebase').getFirebaseFirestore>, userId: string) => {
            if (!firestore) return null;
            const inputsRef = collection(firestore, 'users', userId, 'pending_inputs');
            return query(
                inputsRef,
                where('status', '==', 1), // STATUS_WAITING
                orderBy('created_at', 'desc')
            );
        },
        []
    );

    const mapper = useCallback((snapshot: unknown): PendingInput[] => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const querySnapshot = snapshot as any;
        return querySnapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => {
            const d = doc.data();
            const providerMetadata = (d.provider_metadata ?? d.providerMetadata ?? {}) as Record<string, string>;
            const input: PendingInput = {
                id: doc.id,
                // Core identity
                activityId:               String(d.activity_id ?? d.activityId ?? doc.id),
                userId:                   String(d.user_id ?? d.userId ?? ''),
                status:                   (d.status ?? PendingInput_Status.STATUS_WAITING) as PendingInput_Status,
                pipelineId:               String(d.pipeline_id ?? d.pipelineId ?? ''),
                enricherProviderId:       String(d.enricher_provider_id ?? d.enricherProviderId ?? ''),
                linkedActivityId:         String(d.linked_activity_id ?? d.linkedActivityId ?? ''),
                originalPayloadUri:       String(d.original_payload_uri ?? d.originalPayloadUri ?? ''),
                // Fields
                requiredFields:           (d.required_fields ?? d.requiredFields ?? []) as string[],
                inputData:                (d.input_data ?? d.inputData ?? {}) as Record<string, string>,
                providerMetadata,
                // Booleans
                autoPopulated:            Boolean(d.auto_populated ?? d.autoPopulated ?? false),
                continuedWithoutResolution: Boolean(d.continued_without_resolution ?? d.continuedWithoutResolution ?? false),
                // Timestamps
                createdAt:                toDate(d.created_at ?? d.createdAt),
                updatedAt:                toDate(d.updated_at ?? d.updatedAt),
                completedAt:              toDate(d.completed_at ?? d.completedAt),
                autoDeadline:             toDate(d.auto_deadline ?? d.autoDeadline),
                // Source activity display metadata (populated for FIT file uploads)
                sourceDisplayName:        String(d.source_display_name ?? d.sourceDisplayName ?? ''),
                sourceActivityType:       String(d.source_activity_type ?? d.sourceActivityType ?? ''),
                sourceStartTime:          toDate(d.source_start_time ?? d.sourceStartTime),
                sourceActivitySource:     String(d.source_activity_source ?? d.sourceActivitySource ?? ''),
                nonBlocking:              Boolean(d.non_blocking ?? d.nonBlocking ?? false),
            };
            input.displayConfig = parseDisplayConfig(providerMetadata);
            return input;
        });
    }, []);

    const handleData = useCallback((data: PendingInput[]) => {
        setInputs(data);
        setLastUpdated(new Date());
        setLoaded(true);
        setLoading(false);
    }, [setInputs, setLastUpdated, setLoaded, setLoading]);

    const { loading, error, isListening, refresh } = useFirestoreListener({
        listenerKey: 'pending_inputs',
        queryFactory,
        mapper,
        onData: handleData,
    });

    return {
        inputs,
        loading,
        isListening,
        error,
        refresh
    };
};
