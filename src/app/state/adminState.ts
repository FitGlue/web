import { atom } from 'jotai';
import type { components } from '../../shared/api/schema-admin';

// ============================================================================
// Tab State
// ============================================================================
export type AdminTabId = 'overview' | 'users' | 'pipeline-runs' | 'billing' | 'audit';
export const adminActiveTabAtom = atom<AdminTabId>('overview');

// ============================================================================
// Selected Item Detail State (shared across components)
// ============================================================================
export const selectedPipelineRunIdAtom = atom<string | null>(null);
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
// Admin Types — all sourced directly from the generated admin schema.
// ============================================================================
export type AdminBoosterExecution = components['schemas']['BoosterExecution'];
export type AdminDestinationOutcome = components['schemas']['DestinationOutcome'];
export type AdminStats = components['schemas']['GetAdminStatsResponse'];

// AdminUser is the directory row shape. AdminUserDetail is the aggregated 360°
// view returned by GET /users/{id}.
export type AdminUser = components['schemas']['AdminUserSummary'];
export type AdminUserDetail = components['schemas']['AdminUserDetail'];
export type AdminIntegration = components['schemas']['AdminIntegrationSummary'];
export type AdminPipelineSummary = components['schemas']['AdminPipelineSummary'];
export type AdminPendingInput = components['schemas']['AdminPendingInputSummary'];
export type AdminBilling = components['schemas']['AdminUserBilling'];
export type AdminAuditEntry = components['schemas']['AdminAuditLogEntry'];
export type AdminPipelineRunStats = components['schemas']['AdminPipelineRunStats'];

// AdminPipelineRun: schema PipelineRun + userId which the server includes in
// the admin response but is not declared in the proto yet.
export type AdminPipelineRun = components['schemas']['PipelineRun'] & {
  userId?: string;
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
