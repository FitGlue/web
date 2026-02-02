/**
 * Admin State Management
 * Jotai atoms for admin dashboard state
 */
import { atom } from 'jotai';
import { UserTier } from '../../types/pb/user';

// ============================================================================
// Tab State
// ============================================================================
export type AdminTabId = 'overview' | 'users' | 'pipeline-runs' | 'executions' | 'billing';
export const adminActiveTabAtom = atom<AdminTabId>('overview');

// ============================================================================
// Modal State
// ============================================================================
export const selectedUserIdAtom = atom<string | null>(null);
export const selectedExecutionIdAtom = atom<string | null>(null);
export const selectedPipelineRunIdAtom = atom<string | null>(null);

// ============================================================================
// Selected Item Detail State (shared across components)
// ============================================================================
export const selectedUserDetailAtom = atom<AdminUserDetail | null>(null);
export const selectedUserLoadingAtom = atom<boolean>(false);
export const selectedExecutionDetailAtom = atom<Execution | null>(null);
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

export interface ExecutionFilters {
  service?: string;
  status?: string;
  userId?: string;
  limit?: number;
}

export const userFiltersAtom = atom<UserFilters>({});
export const pipelineRunFiltersAtom = atom<PipelineRunFilters>({ limit: 50 });
export const executionFiltersAtom = atom<ExecutionFilters>({ limit: 50 });

// ============================================================================
// Admin Types
// ============================================================================
export interface AdminStats {
  totalUsers: number;
  athleteUsers: number;
  adminUsers: number;
  totalSyncsThisMonth: number;
  recentExecutions: {
    success: number;
    failed: number;
    started: number;
  };
}

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

export interface Execution {
  id: string;
  service: string;
  status: string;
  userId?: string;
  pipelineExecutionId?: string;
  timestamp: string;
  errorMessage?: string;
  triggerType?: string;
}

export interface BoosterExecution {
  providerName: string;
  status: string;
  durationMs: number;
  metadata?: Record<string, string>;
  error?: string;
}

export interface DestinationOutcome {
  destination: string;
  status: string;
  externalId?: string;
  error?: string;
  completedAt?: string;
}

export interface AdminPipelineRun {
  id: string;
  userId: string;
  pipelineId: string;
  activityId: string;
  source: string;
  sourceActivityId: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  status: string;
  statusMessage?: string;
  boosters: BoosterExecution[];
  destinations: DestinationOutcome[];
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
