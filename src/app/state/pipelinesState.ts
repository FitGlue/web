import { atom } from 'jotai';

export interface PipelineConfig {
  id: string;
  source: string;
  enrichers: { providerType: number; typedConfig?: Record<string, unknown> }[];
  destinations: (string | number)[];
}

export const pipelinesAtom = atom<PipelineConfig[]>([]);
export const pipelinesLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingPipelinesAtom = atom<boolean>(false);
export const isPipelinesLoadedAtom = atom<boolean>(false);
