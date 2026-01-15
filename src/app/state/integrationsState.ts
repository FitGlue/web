import { atom } from 'jotai';
import { components } from '../../shared/api/schema';

// Re-export types from generated schema for convenience
export type IntegrationStatus = components['schemas']['IntegrationStatus'];
export type IntegrationsSummary = components['schemas']['IntegrationsSummary'];

export const integrationsAtom = atom<IntegrationsSummary | null>(null);
export const integrationsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingIntegrationsAtom = atom<boolean>(false);
export const isIntegrationsLoadedAtom = atom<boolean>(false);
