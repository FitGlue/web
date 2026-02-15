/**
 * useSmartNudges — declarative condition evaluator
 *
 * Evaluates the nudge registry conditions against current user state
 * and returns the highest-priority matching nudge for the given page.
 * Dismissals are persisted to localStorage.
 */

import { useMemo, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { useRealtimePipelines } from './useRealtimePipelines';
import { useRealtimeIntegrations } from './useRealtimeIntegrations';
import { isPipelinesLoadedAtom } from '../state/pipelinesState';
import {
    SMART_NUDGES,
    NudgeCondition,
    NudgePage,
    SmartNudgeDefinition,
} from '../data/smartNudges';
import { IntegrationsSummary } from '../state/integrationsState';
import { formatDestination } from '../../types/pb/enum-formatters';

// ── Types ────────────────────────────────────────────────────────

interface PipelineConfig {
    id: string;
    source: string;
    enrichers?: { providerType: number }[];
    destinations: (string | number)[];
}

export interface ActiveNudge extends SmartNudgeDefinition {
    dismiss: () => void;
}

// ── localStorage helpers ─────────────────────────────────────────

const STORAGE_KEY = 'fitglue_dismissed_nudges';

function getDismissedNudges(): Record<string, number> {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function dismissNudge(nudgeId: string): void {
    const dismissed = getDismissedNudges();
    dismissed[nudgeId] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
}

function isNudgeDismissed(nudgeId: string): boolean {
    const dismissed = getDismissedNudges();
    const timestamp = dismissed[nudgeId];
    if (!timestamp) return false;
    // Dismissed nudges reappear after 7 days
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < SEVEN_DAYS;
}

// ── Condition evaluators ─────────────────────────────────────────

export function evaluateCondition(
    condition: NudgeCondition,
    pipelines: PipelineConfig[],
    integrations: IntegrationsSummary | null,
): boolean {
    switch (condition.type) {
        case 'no_connections': {
            if (!integrations) return true;
            return !Object.values(integrations).some(i => i?.connected);
        }

        case 'no_pipelines': {
            // Only fire if user has at least one connection (otherwise 'no_connections' takes priority)
            if (!integrations) return false;
            const hasAnyConnection = Object.values(integrations).some(i => i?.connected);
            return hasAnyConnection && pipelines.length === 0;
        }

        case 'missing_enricher': {
            if (pipelines.length === 0) return false;
            const { sourceId, enricherProviderType } = condition;
            // Find pipelines with the matching source
            const relevantPipelines = sourceId
                ? pipelines.filter(p => p.source === sourceId)
                : pipelines;
            if (relevantPipelines.length === 0) return false;
            // Check if ANY of them have the enricher — if none do, fire the nudge
            return !relevantPipelines.some(p =>
                p.enrichers?.some(e => e.providerType === enricherProviderType),
            );
        }

        case 'missing_destination': {
            if (pipelines.length === 0) return false;
            const { destinationId } = condition;
            const target = destinationId?.toLowerCase();
            // Fire if NO pipeline sends to this destination
            // Destinations are stored as numeric protobuf enums, so resolve via formatDestination
            return !pipelines.some(p =>
                p.destinations.some(d =>
                    formatDestination(d).toLowerCase() === target,
                ),
            );
        }

        case 'unused_connection': {
            const { integrationId } = condition;
            if (!integrationId || !integrations) return false;
            const integration = integrations[integrationId as keyof IntegrationsSummary];
            if (!integration?.connected) return false;
            // Connected but no pipeline uses it as a source or destination
            const usedAsSource = pipelines.some(p => p.source === integrationId);
            const usedAsDestination = pipelines.some(p =>
                p.destinations.some(d =>
                    formatDestination(d).toLowerCase() === integrationId,
                ),
            );
            return !usedAsSource && !usedAsDestination;
        }

        default:
            return false;
    }
}

// ── Hook ─────────────────────────────────────────────────────────

export function useSmartNudges(page: NudgePage): ActiveNudge | null {
    // Force re-render when a nudge is dismissed
    const [, setDismissVersion] = useState(0);

    const { pipelines } = useRealtimePipelines();
    const { integrations } = useRealtimeIntegrations();
    const [pipelinesLoaded] = useAtom(isPipelinesLoadedAtom);

    const activeNudge = useMemo(() => {
        // Don't evaluate nudges until pipelines have loaded — prevents false
        // positives during the initial fetch when the array is still empty.
        if (!pipelinesLoaded) return null;

        // Filter nudges for this page, not dismissed, and matching condition
        const candidates = SMART_NUDGES
            .filter(n => n.pages.includes(page))
            .filter(n => !isNudgeDismissed(n.id))
            .filter(n => evaluateCondition(
                n.condition,
                pipelines as PipelineConfig[],
                integrations,
            ))
            .sort((a, b) => b.priority - a.priority);

        return candidates[0] ?? null;
    }, [page, pipelines, integrations, pipelinesLoaded]);

    const dismiss = useCallback(() => {
        if (activeNudge) {
            dismissNudge(activeNudge.id);
            setDismissVersion(v => v + 1);
        }
    }, [activeNudge]);

    if (!activeNudge) return null;

    return { ...activeNudge, dismiss };
}
