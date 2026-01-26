import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { pendingInputsAtom, isLoadingInputsAtom, isInputsLoadedAtom, inputsLastUpdatedAtom } from '../state/inputsState';
import { InputsService } from '../services/InputsService';

export const useInputs = () => {
  const [inputs, setInputs] = useAtom(pendingInputsAtom);
  const [loading, setLoading] = useAtom(isLoadingInputsAtom);
  const [loaded, setLoaded] = useAtom(isInputsLoadedAtom);
  const [lastUpdated, setLastUpdated] = useAtom(inputsLastUpdatedAtom);

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
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching inputs:', error);
    } finally {
      setLoading(false);
    }
  }, [loaded, setLoaded, setInputs, setLoading, setLastUpdated]);

  // Initial load
  useEffect(() => {
    fetchInputs();
  }, [fetchInputs]);

  return {
    inputs,
    loading,
    loaded,
    lastUpdated,
    refresh: () => fetchInputs(true),
  };
};
