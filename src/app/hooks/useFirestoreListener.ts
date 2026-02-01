import { useEffect, useState, useCallback, useRef } from 'react';
import { Query, DocumentReference, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '../../shared/firebase';

export type FirestoreQueryFactory<T> = (
    firestore: ReturnType<typeof getFirebaseFirestore>,
    userId: string
) => Query<T> | DocumentReference<T> | null;

export type FirestoreDataMapper<TFirestore, TData> = (
    snapshot: TFirestore
) => TData;

interface UseFirestoreListenerOptions<TData> {
    /** Factory function to create the Firestore query or document reference */
    queryFactory: FirestoreQueryFactory<unknown>;
    /** Optional Jotai setter to update global state */
    onData?: (data: TData) => void;
    /** Whether the listener is enabled */
    enabled?: boolean;
}

interface UseFirestoreListenerResult<TData> {
    data: TData | null;
    loading: boolean;
    error: Error | null;
    isListening: boolean;
    refresh: () => void;
}

/**
 * useFirestoreListener - Generic Firestore Real-time Listener Hook
 * 
 * This hook provides a consistent pattern for listening to Firestore data.
 * It handles:
 * - Firebase auth state
 * - Firestore initialization
 * - Loading/error/listening states
 * - Automatic cleanup on unmount
 * 
 * Usage:
 * ```ts
 * const { data, loading, error } = useFirestoreListener({
 *   queryFactory: (firestore, userId) => 
 *     collection(firestore, 'users', userId, 'pipelines'),
 *   mapper: (snapshot) => snapshot.docs.map(doc => mapPipeline(doc)),
 *   onData: setPipelines, // optional Jotai setter
 * });
 * ```
 */
export function useFirestoreListener<TData>(
    options: UseFirestoreListenerOptions<TData> & {
        mapper: (snapshot: unknown) => TData;
    }
): UseFirestoreListenerResult<TData> {
    const { queryFactory, mapper, onData, enabled = true } = options;

    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;

    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Use refs to store callbacks to prevent effect re-runs when callback identity changes
    const mapperRef = useRef(mapper);
    const onDataRef = useRef(onData);

    // Keep refs up to date
    mapperRef.current = mapper;
    onDataRef.current = onData;

    useEffect(() => {
        if (!enabled || !currentUser?.uid) {
            setIsListening(false);
            setLoading(false);
            return;
        }

        const firestore = getFirebaseFirestore();
        if (!firestore) {
            console.warn('Firestore not initialized - real-time listener disabled');
            setLoading(false);
            return;
        }

        setLoading(true);
        let unsubscribe: Unsubscribe | null = null;

        try {
            const queryOrRef = queryFactory(firestore, currentUser.uid);
            if (!queryOrRef) {
                setLoading(false);
                return;
            }

            unsubscribe = onSnapshot(
                queryOrRef as Query,
                (snapshot) => {
                    try {
                        const mappedData = mapperRef.current(snapshot);
                        setData(mappedData);
                        onDataRef.current?.(mappedData);
                        setError(null);
                        setIsListening(true);
                    } catch (err) {
                        console.error('Error mapping Firestore data:', err);
                        setError(err instanceof Error ? err : new Error('Mapping error'));
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    console.error('Firestore listener error:', err);
                    setError(err);
                    setLoading(false);
                    setIsListening(false);
                }
            );
        } catch (err) {
            console.error('Failed to set up Firestore listener:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            setIsListening(false);
        };
    }, [enabled, currentUser?.uid, queryFactory, refreshTrigger]);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return {
        data,
        loading,
        error,
        isListening,
        refresh,
    };
}

/**
 * useFirestoreDocument - Convenience wrapper for single document listeners
 */
export function useFirestoreDocument<TData>(
    options: Omit<UseFirestoreListenerOptions<TData>, 'queryFactory'> & {
        docFactory: (firestore: ReturnType<typeof getFirebaseFirestore>, userId: string) => DocumentReference | null;
        mapper: (data: unknown | undefined) => TData;
    }
): UseFirestoreListenerResult<TData> {
    const { docFactory, mapper, ...rest } = options;

    return useFirestoreListener({
        ...rest,
        queryFactory: docFactory as FirestoreQueryFactory<unknown>,
        mapper: (snapshot: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const docSnapshot = snapshot as any;
            if (!docSnapshot.exists?.()) {
                return mapper(undefined);
            }
            return mapper(docSnapshot.data());
        },
    });
}
