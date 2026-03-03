import { atom } from 'jotai';

// These types are not yet in the gateway OpenAPI spec. Defined locally
// until integration-related endpoints are added to the gateway proto.
export interface IntegrationStatus {
    connected?: boolean;
    provider?: string;
    lastSyncedAt?: string;
    /** Additional non-sensitive details from the integration (e.g., countryUrl for Parkrun) */
    additionalDetails?: Record<string, string>;
    [key: string]: unknown;
}

export type IntegrationsSummary = Record<string, IntegrationStatus>;

export const integrationsAtom = atom<IntegrationsSummary | null>(null);
export const integrationsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingIntegrationsAtom = atom<boolean>(false);
export const isIntegrationsLoadedAtom = atom<boolean>(false);
