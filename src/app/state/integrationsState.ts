import { atom } from 'jotai';

export interface IntegrationStatus {
  connected: boolean;
  externalUserId?: string;
  lastUsedAt?: string;
}

export interface IntegrationsSummary {
  hevy?: IntegrationStatus;
  strava?: IntegrationStatus;
  fitbit?: IntegrationStatus;
  [key: string]: IntegrationStatus | undefined;
}

export const integrationsAtom = atom<IntegrationsSummary | null>(null);
export const integrationsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingIntegrationsAtom = atom<boolean>(false);
export const isIntegrationsLoadedAtom = atom<boolean>(false);
