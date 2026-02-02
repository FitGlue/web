import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { doc, onSnapshot } from 'firebase/firestore';
import { activityStatsAtom } from '../state/activitiesState';
import { getFirebaseFirestore, getFirebaseAuth } from '../../shared/firebase';

/**
 * useRealtimeStats - Live Statistics Hook
 *
 * Watches the user document for activityCounts changes and updates stats in real-time.
 * Properly manages the Firestore listener lifecycle with useEffect cleanup.
 */
export const useRealtimeStats = (enabled = true) => {
    const [, setStats] = useAtom(activityStatsAtom);

    useEffect(() => {
        if (!enabled) return;

        const auth = getFirebaseAuth();
        const currentUser = auth?.currentUser;
        const firestore = getFirebaseFirestore();

        if (!currentUser?.uid || !firestore) return;

        const userRef = doc(firestore, 'users', currentUser.uid);

        const unsubscribe = onSnapshot(
            userRef,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (snapshot: any) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    if (data?.activityCounts?.weeklySync !== undefined) {
                        setStats({ synchronizedCount: data.activityCounts.weeklySync });
                    }
                }
            },
            (err: Error) => {
                console.error('[useRealtimeStats] Listener error:', err);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [enabled, setStats]);
};
