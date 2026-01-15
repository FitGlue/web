import { atom } from 'jotai';
import { components } from '../../shared/api/schema';

// Re-export type from generated schema for convenience
export type PipelineConfig = components['schemas']['PipelineConfig'];

export const pipelinesAtom = atom<PipelineConfig[]>([]);
export const pipelinesLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingPipelinesAtom = atom<boolean>(false);
export const isPipelinesLoadedAtom = atom<boolean>(false);
