import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { pendingInputsAtom, isLoadingInputsAtom, isInputsLoadedAtom } from '../state/inputsState';
import { InputsService } from '../services/InputsService';

export const useInputs = () => {
  const [inputs, setInputs] = useAtom(pendingInputsAtom);
  const [loading, setLoading] = useAtom(isLoadingInputsAtom);
  const [loaded, setLoaded] = useAtom(isInputsLoadedAtom);

  const fetchInputs = useCallback(async (force = false) => {
    // Cache-first: don't fetch if we already have loaded data (unless forced)
    if (!force && loaded) {
      return;
    }

    setLoading(true);
    try {
      const data = await InputsService.getPendingInputs();
      setInputs(data);
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching inputs:', error);
    } finally {
      setLoading(false);
    }
  }, [loaded, setLoaded, setInputs, setLoading]);

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
