import { atom } from 'jotai';
import { UserTier } from '../../types/pb/user';
import type { components } from '../../shared/api/schema-admin';

// ============================================================================
// Tab State
// ============================================================================
export type AdminTabId = 'overview' | 'users' | 'pipeline-runs' | 'billing';
export const adminActiveTabAtom = atom<AdminTabId>('overview');

// ============================================================================
// Modal State
// ============================================================================
export const selectedUserIdAtom = atom<string | null>(null);
export const selectedPipelineRunIdAtom = atom<string | null>(null);

// ============================================================================
// Selected Item Detail State (shared across components)
// ============================================================================
export const selectedUserDetailAtom = atom<AdminUserDetail | null>(null);
export const selectedUserLoadingAtom = atom<boolean>(false);
export const selectedPipelineRunDetailAtom = atom<AdminPipelineRun | null>(null);

// ============================================================================
// Filter State
// ============================================================================
export interface UserFilters {
  tier?: string;
  userId?: string;
}

export interface PipelineRunFilters {
  status?: string;
  source?: string;
  userId?: string;
  limit?: number;
}

export const userFiltersAtom = atom<UserFilters>({});
export const pipelineRunFiltersAtom = atom<PipelineRunFilters>({ limit: 50 });

// ============================================================================
// Admin Types — sourced from schema-admin where the schema is accurate.
// Local types are kept where the server returns richer data than the proto
// declares (see comments). These should shrink as the admin proto is updated.
// ============================================================================

// Direct schema aliases — these match exactly.
export type AdminBoosterExecution = components['schemas']['BoosterExecution'];
export type AdminDestinationOutcome = components['schemas']['DestinationOutcome'];
export type AdminStats = components['schemas']['GetAdminStatsResponse'];

// AdminPipelineRun: schema PipelineRun + userId which the server includes in
// the admin response but is not declared in the proto yet.
export type AdminPipelineRun = components['schemas']['PipelineRun'] & {
  userId?: string;
};

// AdminUser and AdminUserDetail: kept local because the server returns
// integrations, pipelineCount, pipelines[], activityCount, pendingInputs, etc.
// that are not declared in UserProfile in the admin proto.
export interface AdminUser {
  userId: string;
  createdAt: string;
  tier: UserTier;
  trialEndsAt?: string;
  isAdmin: boolean;
  accessEnabled: boolean;
  syncCountThisMonth: number;
  preventedSyncCount: number;
  stripeCustomerId?: string;
  integrations: string[];
  pipelineCount: number;
}

export interface PendingInputDetail {
  activityId: string;
  status: 'waiting' | 'unspecified';
  enricherProviderId?: string;
  createdAt?: string;
}

export interface AdminUserDetail {
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: string;
  tier: UserTier;
  trialEndsAt?: string;
  isAdmin: boolean;
  accessEnabled: boolean;
  syncCountThisMonth: number;
  preventedSyncCount: number;
  stripeCustomerId?: string;
  syncCountResetAt?: string;
  integrations: Record<string, { enabled?: boolean; lastUsedAt?: string }>;
  pipelines: { id: string; name: string; source: string; destinations: string[] }[];
  activityCount: number;
  pendingInputCount: number;
  pendingInputs?: PendingInputDetail[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
