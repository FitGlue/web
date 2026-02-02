import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestoreListener } from './useFirestoreListener';
import {
    pendingInputsAtom,
    inputsLastUpdatedAtom,
    isLoadingInputsAtom,
    isInputsLoadedAtom
} from '../state/inputsState';
import { PendingInput as TBasePendingInput } from '../services/InputsService';

// Define the PendingInput type with all fields
export interface PendingInput extends Omit<TBasePendingInput, 'providerMetadata'> {
    providerMetadata?: { [key: string]: string };
    updatedAt?: string;
    userId?: string;
    deadline?: string;
    autoPopulated?: boolean;
    providerType?: number;
}

// Helper to convert Firestore Timestamp to ISO string
const toISOString = (value: unknown): string | undefined => {
    if (!value) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any;
    if (v.toDate && typeof v.toDate === 'function') {
        return v.toDate().toISOString();
    }
    if (v instanceof Date) {
        return v.toISOString();
    }
    if (typeof v === 'string') {
        return v;
    }
    return undefined;
};

/**
 * useRealtimeInputs - Firebase SDK Real-time Hook
 *
 * Listens to `users/{userId}/pending_inputs` via onSnapshot.
 * Uses the shared useFirestoreListener for common functionality.
 *
 * Architecture: Firebase SDK for reads, REST for mutations only.
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
            const data = doc.data();
            const input: PendingInput = {
                id: doc.id,
                activityId: (data.activity_id || data.activityId || doc.id) as string,
                status: data.status as number,
                requiredFields: (data.required_fields || data.requiredFields || []) as string[],
                inputData: (data.input_data || data.inputData || {}) as Record<string, string>,
                createdAt: toISOString(data.created_at) || toISOString(data.createdAt),
                updatedAt: toISOString(data.updated_at) || toISOString(data.updatedAt),
                deadline: toISOString(data.deadline),
                autoPopulated: (data.auto_populated || data.autoPopulated || false) as boolean,
                providerType: (data.provider_type || data.providerType) as number | undefined,
                providerMetadata: (data.provider_metadata || data.providerMetadata || {}) as { [key: string]: string }
            };
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
