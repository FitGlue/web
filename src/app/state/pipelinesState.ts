import { atom } from 'jotai';

/**
 * Pipeline config as stored in Firestore.
 *
 * Defined locally (not from the generated OpenAPI schema) because pipelines
 * are read via realtime Firestore listeners, not through the REST API.
 * The shape matches what firestore_store.go writes.
 */
export interface PipelineConfig {
    id: string;
    name?: string;
    source: string;
    enrichers: Array<{
        providerType: number;
        typedConfig?: Record<string, string>;
    }>;
    destinations: (string | number)[];
    disabled?: boolean;
    sourceConfig?: Record<string, string>;
    destinationConfigs?: Record<string, {
        config: Record<string, string>;
        excludedEnrichers?: string[];
    }>;
}

export const pipelinesAtom = atom<PipelineConfig[]>([]);
export const pipelinesLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingPipelinesAtom = atom<boolean>(false);
export const isPipelinesLoadedAtom = atom<boolean>(false);
