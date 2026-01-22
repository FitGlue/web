import { atom } from 'jotai';
import { PluginRegistryResponse } from '../types/plugin';

// Shared atoms for plugin registry state - prevents multiple components
// from each triggering their own fetch requests
export const pluginRegistryAtom = atom<PluginRegistryResponse | null>(null);
export const pluginRegistryLastUpdatedAtom = atom<Date | null>(null);
export const isLoadingPluginRegistryAtom = atom<boolean>(false);
export const isPluginRegistryLoadedAtom = atom<boolean>(false);
export const pluginRegistryErrorAtom = atom<string | null>(null);
