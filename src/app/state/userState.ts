import { atom } from 'jotai';
import { components } from '../../shared/api/schema';

// Re-export types from generated schema for convenience
export type EnricherConfig = components['schemas']['EnricherConfig'];
export type PipelineConfig = components['schemas']['PipelineConfig'];
export type UserProfile = components['schemas']['UserProfile'];

export const userProfileAtom = atom<UserProfile | null>(null);
export const profileLoadingAtom = atom<boolean>(false);
export const profileErrorAtom = atom<string | null>(null);
