import { atom } from 'jotai';
import { components } from '../../shared/api/schema';

// Base type from generated schema
type BaseIntegrationStatus = components['schemas']['IntegrationStatus'];

// Extended type with additional details for UI display
export interface IntegrationStatus extends BaseIntegrationStatus {
    /** Additional non-sensitive details from the integration (e.g., countryUrl for Parkrun) */
    additionalDetails?: Record<string, string>;
}

// Extended summary using our enhanced IntegrationStatus
export type IntegrationsSummary = {
    [K in keyof components['schemas']['IntegrationsSummary']]?: IntegrationStatus;
};

export const integrationsAtom = atom<IntegrationsSummary | null>(null);
export const integrationsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingIntegrationsAtom = atom<boolean>(false);
export const isIntegrationsLoadedAtom = atom<boolean>(false);
