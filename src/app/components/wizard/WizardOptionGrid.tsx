import React from 'react';
import { Grid } from '../library/layout/Grid';
import { WizardOptionCard, WizardOptionCardProps } from './WizardOptionCard';
import './WizardOptionGrid.css';

export interface WizardOptionGridOption {
    id: string;
    icon?: string;
    iconType?: string;
    iconPath?: string;
    name: string;
    description?: string;
    isPremium?: boolean;
    configSchema?: unknown[];
}

export interface WizardOptionGridProps<T extends WizardOptionGridOption> {
    options: T[];
    selectedIds: string[];
    onSelect: (option: T) => void;
    /** 'single' for radio-style, 'multi' for checkbox-style */
    selectionMode?: 'single' | 'multi';
    getOptionProps?: (option: T, isSelected: boolean) => Partial<WizardOptionCardProps>;
}

export function WizardOptionGrid<T extends WizardOptionGridOption>({
    options,
    selectedIds,
    onSelect,
    selectionMode = 'multi',
    getOptionProps,
}: WizardOptionGridProps<T>): React.ReactElement {
    return (
        <Grid cols={3} gap="md">
            {options.map(option => {
                const isSelected = selectedIds.includes(option.id);
                const customProps = getOptionProps?.(option, isSelected) ?? {};

                return (
                    <WizardOptionCard
                        key={option.id}
                        icon={option.icon || ''}
                        iconType={option.iconType}
                        iconPath={option.iconPath}
                        title={option.name}
                        description={option.description}
                        selected={isSelected}
                        isPremium={option.isPremium}
                        hasConfig={Array.isArray(option.configSchema) && option.configSchema.length > 0}
                        selectionMode={selectionMode}
                        onClick={() => onSelect(option)}
                        {...customProps}
                    />
                );
            })}
        </Grid>
    );
}
