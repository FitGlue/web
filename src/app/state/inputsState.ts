import { atom } from 'jotai';
import type { PendingInput as ProtoPendingInput } from '../../types/pb/models/pipeline/pending_input';

/** Structured display configuration parsed from provider_metadata display.* keys */
export interface DisplayConfig {
    fieldLabels?: Record<string, string>;
    fieldTypes?: Record<string, string>;
    summary?: string;
    title?: string;
    help?: string;
}

/**
 * PendingInput as it lives in the web app state.
 *
 * Extends the proto-generated type with:
 * - `id`: the Firestore document ID (not in proto)
 * - `displayConfig`: parsed from provider_metadata display.* keys
 *
 * All other fields (activityId, pipelineId, requiredFields, sourceDisplayName, etc.)
 * come directly from the proto type and are kept in sync via `make generate`.
 */
export interface PendingInput extends ProtoPendingInput {
    id?: string;
    displayConfig?: DisplayConfig;
}

export const pendingInputsAtom = atom<PendingInput[]>([]);
export const inputsLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingInputsAtom = atom<boolean>(false);
export const isInputsLoadedAtom = atom<boolean>(false);
