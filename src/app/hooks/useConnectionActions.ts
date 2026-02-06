import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export interface ActionDefinition {
    id: string;
    label: string;
    description: string;
    icon: string;
}

export interface ActionJob {
    jobId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: {
        recordsImported: number;
        recordsSkipped: number;
        details: string[];
    };
    error?: string;
}

interface TriggerResult {
    jobId: string;
    message: string;
}

/**
 * Hook for managing connection-specific actions (like importing historical PRs)
 */
export const useConnectionActions = (sourceId: string) => {
    const api = useApi();
    const [runningActions, setRunningActions] = useState<Set<string>>(new Set());
    const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
    const [errors, setErrors] = useState<Record<string, string>>({});

    /**
     * Trigger an action for the given connection
     * Returns immediately after the job is enqueued (async processing)
     */
    const triggerAction = useCallback(async (actionId: string): Promise<TriggerResult> => {
        // Mark as running
        setRunningActions(prev => new Set(prev).add(actionId));
        setErrors(prev => {
            const next = { ...prev };
            delete next[actionId];
            return next;
        });

        try {
            const result = await api.post(`/integrations/${sourceId}/actions/${actionId}`) as TriggerResult;

            // Mark action as completed (it's been queued for background processing)
            setCompletedActions(prev => new Set(prev).add(actionId));

            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to trigger action';
            setErrors(prev => ({ ...prev, [actionId]: message }));
            throw error;
        } finally {
            setRunningActions(prev => {
                const next = new Set(prev);
                next.delete(actionId);
                return next;
            });
        }
    }, [api, sourceId]);

    /**
     * Check if an action is currently running
     */
    const isActionRunning = useCallback((actionId: string) => {
        return runningActions.has(actionId);
    }, [runningActions]);

    /**
     * Check if an action has been triggered this session
     */
    const isActionCompleted = useCallback((actionId: string) => {
        return completedActions.has(actionId);
    }, [completedActions]);

    /**
     * Get error message for an action
     */
    const getActionError = useCallback((actionId: string) => {
        return errors[actionId];
    }, [errors]);

    /**
     * Reset the state for an action (allows re-triggering)
     */
    const resetAction = useCallback((actionId: string) => {
        setCompletedActions(prev => {
            const next = new Set(prev);
            next.delete(actionId);
            return next;
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next[actionId];
            return next;
        });
    }, []);

    return {
        triggerAction,
        isActionRunning,
        isActionCompleted,
        getActionError,
        resetAction,
    };
};
