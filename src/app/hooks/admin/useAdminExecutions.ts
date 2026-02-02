import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useApi } from '../useApi';
import { Execution, executionFiltersAtom } from '../../state/adminState';

export interface UseAdminExecutionsResult {
  executions: Execution[];
  availableServices: string[];
  loading: boolean;
  error: string | null;
  selectedExecution: Execution | null;
  fetchExecutions: () => Promise<void>;
  selectExecution: (execution: Execution | null) => void;
}

interface ExecutionsResponse {
  executions: Execution[];
  availableServices: string[];
}

/**
 * Hook for fetching admin execution logs
 */
export function useAdminExecutions(): UseAdminExecutionsResult {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  
  const filters = useAtomValue(executionFiltersAtom);
  const api = useApi();

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.service) params.set('service', filters.service);
      if (filters.status) params.set('status', filters.status);
      if (filters.userId) params.set('userId', filters.userId);
      params.set('limit', String(filters.limit || 50));

      const data = await api.get(`/admin/executions?${params.toString()}`) as ExecutionsResponse;
      setExecutions(data.executions);
      setAvailableServices(data.availableServices || []);
    } catch (err) {
      console.error('Failed to fetch executions:', err);
      setError('Failed to load executions');
    } finally {
      setLoading(false);
    }
  }, [api, filters]);

  const selectExecution = useCallback((execution: Execution | null) => {
    setSelectedExecution(execution);
  }, []);

  return {
    executions,
    availableServices,
    loading,
    error,
    selectedExecution,
    fetchExecutions,
    selectExecution,
  };
}
