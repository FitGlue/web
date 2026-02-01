import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtom } from 'jotai';
import { activitiesAtom } from '../state/activitiesState';
import { ActivitiesService, ExecutionRecord } from '../services/ActivitiesService';

/**
 * useActivityTrace - On-demand Execution Trace Loading
 *
 * Fetches the pipelineExecution trace for an activity when requested.
 * Updates the global activities atom with the loaded trace.
 * Uses caching to prevent re-fetching.
 */
export const useActivityTrace = (activityId: string | undefined) => {
    const [activities, setActivities] = useAtom(activitiesAtom);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const fetchedRef = useRef<Set<string>>(new Set());

    const activity = activities.find(a => a.activityId === activityId);
    const hasTrace = !!activity?.pipelineExecution;
    const hasPipelineExecutionId = !!activity?.pipelineExecutionId;

    const fetchTrace = useCallback(async () => {
        if (!activityId || !hasPipelineExecutionId || hasTrace) return;
        if (fetchedRef.current.has(activityId)) return;

        fetchedRef.current.add(activityId);
        setLoading(true);
        setError(null);

        try {
            const result = await ActivitiesService.get(activityId);
            if (result?.pipelineExecution && result.pipelineExecution.length > 0) {
                setActivities(prev =>
                    prev.map(a =>
                        a.activityId === activityId
                            ? { ...a, pipelineExecution: result.pipelineExecution }
                            : a
                    )
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch trace'));
            fetchedRef.current.delete(activityId);
        } finally {
            setLoading(false);
        }
    }, [activityId, hasPipelineExecutionId, hasTrace, setActivities]);

    return {
        hasTrace,
        loading,
        error,
        fetchTrace,
        pipelineExecution: activity?.pipelineExecution,
    };
};

/**
 * useLazyActivityTrace - Viewport-Based Lazy Loading
 *
 * Wraps useActivityTrace with IntersectionObserver to automatically
 * load the trace when the element enters the viewport.
 */
export const useLazyActivityTrace = (activityId: string | undefined) => {
    const { hasTrace, loading, error, fetchTrace, pipelineExecution } = useActivityTrace(activityId);
    const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!activityId || hasTrace) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !hasEnteredViewport) {
                    setHasEnteredViewport(true);
                    fetchTrace();
                }
            },
            { threshold: 0.1, rootMargin: '500px' } // Start loading 500px before entering viewport
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [activityId, hasTrace, hasEnteredViewport, fetchTrace]);

    return {
        ref: elementRef,
        hasTrace,
        loading,
        error,
        pipelineExecution,
    };
};

/**
 * useBatchActivityTraces - Batch Loading for Multiple Activities
 *
 * Loads traces for multiple activities in a single batch when triggered.
 */
export const useBatchActivityTraces = () => {
    const [activities, setActivities] = useAtom(activitiesAtom);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef<Set<string>>(new Set());

    const loadTracesForActivities = useCallback(async (activityIds: string[]) => {
        const toLoad = activityIds.filter(id => {
            const activity = activities.find(a => a.activityId === id);
            return activity?.pipelineExecutionId && !activity.pipelineExecution && !loadingRef.current.has(id);
        });

        if (toLoad.length === 0) return;

        toLoad.forEach(id => loadingRef.current.add(id));
        setLoading(true);

        try {
            const results = await Promise.allSettled(
                toLoad.map(id => ActivitiesService.get(id))
            );

            const updates: Map<string, ExecutionRecord[]> = new Map();
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value?.pipelineExecution) {
                    updates.set(toLoad[index], result.value.pipelineExecution);
                }
            });

            if (updates.size > 0) {
                setActivities(prev =>
                    prev.map(a => {
                        const trace = updates.get(a.activityId!);
                        return trace ? { ...a, pipelineExecution: trace } : a;
                    })
                );
            }
        } finally {
            toLoad.forEach(id => loadingRef.current.delete(id));
            setLoading(false);
        }
    }, [activities, setActivities]);

    return { loading, loadTracesForActivities };
};
