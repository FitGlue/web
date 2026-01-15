import { atom } from 'jotai';

export interface UserProfile {
  userId: string;
  createdAt: string;
  tier: 'free' | 'pro';
  trialEndsAt?: string;
  isAdmin: boolean;
  syncCountThisMonth: number;
  integrations: {
    hevy: { connected: boolean; externalUserId?: string; lastUsedAt?: string };
    strava: { connected: boolean; externalUserId?: string; lastUsedAt?: string };
    fitbit: { connected: boolean; externalUserId?: string; lastUsedAt?: string };
  };
  pipelines: any[];
}

export const userProfileAtom = atom<UserProfile | null>(null);
export const profileLoadingAtom = atom<boolean>(false);
export const profileErrorAtom = atom<string | null>(null);
