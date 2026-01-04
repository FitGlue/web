import { atom } from 'jotai';
import { PendingInput } from '../services/InputsService';

export const pendingInputsAtom = atom<PendingInput[]>([]);
export const isLoadingInputsAtom = atom<boolean>(false);
