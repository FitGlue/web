import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { pendingInputsAtom, isLoadingInputsAtom } from '../state/inputsState';
import { InputsService } from '../services/InputsService';

export const useInputs = () => {
  const [inputs, setInputs] = useAtom(pendingInputsAtom);
  const [loading, setLoading] = useAtom(isLoadingInputsAtom);

  const fetchInputs = useCallback(async (force = false) => {
    // Cache-first: don't fetch if we already have data (unless forced)
    if (!force && inputs.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const data = await InputsService.getPendingInputs();
      setInputs(data);
    } catch (error) {
      console.error('Error fetching inputs:', error);
    } finally {
      setLoading(false);
    }
  }, [inputs.length, setInputs, setLoading]);

  // Initial load
  useEffect(() => {
    fetchInputs();
  }, [fetchInputs]);

  return {
    inputs,
    loading,
    refresh: () => fetchInputs(true),
  };
};
