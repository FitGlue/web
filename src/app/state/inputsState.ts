import { atom } from 'jotai';
import { PendingInput as BasePendingInput } from '../services/InputsService';

/** Structured display configuration parsed from provider_metadata display.* keys */
export interface DisplayConfig {
    fieldLabels?: Record<string, string>;
    fieldTypes?: Record<string, string>;
    summary?: string;
    title?: string;
    help?: string;
}

/** Extended PendingInput with parsed display config and additional fields */
export interface PendingInput extends Omit<BasePendingInput, 'providerMetadata'> {
    providerMetadata?: { [key: string]: string };
    displayConfig?: DisplayConfig;
    updatedAt?: string;
    userId?: string;
    deadline?: string;
    autoPopulated?: boolean;
    providerType?: number;
    pipelineId?: string;
}

export const pendingInputsAtom = atom<PendingInput[]>([]);
export const inputsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingInputsAtom = atom<boolean>(false);
export const isInputsLoadedAtom = atom<boolean>(false);
