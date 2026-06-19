import { useState, useCallback, useEffect } from 'react';
import { adminClient } from '../../../shared/api/admin-client';
import { logger } from '../../../shared/logger';
import { AdminAuditEntry } from '../../state/adminState';

export interface UseAdminAuditLogResult {
  entries: AdminAuditEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * useAdminAuditLog loads the admin audit trail, optionally scoped to one user.
 */
export function useAdminAuditLog(targetUserId?: string, limit = 100): UseAdminAuditLogResult {
  const [entries, setEntries] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminClient.GET('/audit-log', {
        params: { query: { targetUserId, limit } },
      });
      setEntries((data?.entries as AdminAuditEntry[]) ?? []);
    } catch (err) {
      logger.warn('Failed to load admin audit log:', err);
      setError('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [targetUserId, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, error, refresh };
}
