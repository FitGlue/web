import React from 'react';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Stack } from '../library/layout/Stack';
import { Card } from '../library/ui/Card';
import { PremiumBadge } from '../library/ui/PremiumBadge';
import { PluginIcon } from '../library/ui/PluginIcon';
import './WizardOptionCard.css';

export interface WizardOptionCardProps {
    icon: string;
    iconType?: string;
    iconPath?: string;
    title: string;
    description?: string;
    selected?: boolean;
    disabled?: boolean;
    isPremium?: boolean;
    hasConfig?: boolean;
    /** 'single' shows radio button, 'multi' shows checkbox */
    selectionMode?: 'single' | 'multi';
    onClick?: () => void;
}

export const WizardOptionCard: React.FC<WizardOptionCardProps> = ({
    icon,
    iconType = 'emoji',
    iconPath,
    title,
    description,
    selected = false,
    disabled = false,
    isPremium = false,
    hasConfig = false,
    selectionMode = 'multi',
    onClick,
}) => {
    const indicatorClass = selectionMode === 'single' ? 'radio' : 'checkbox';
    const wrapperClasses = [
        'wizard-option-card',
        selected && 'selected',
        disabled && 'disabled',
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses} onClick={disabled ? undefined : onClick}>
            <Card
                variant={selected ? 'elevated' : 'default'}
                highlighted={selected}
            >
                {/* Selection indicator in top-right corner */}
                <div className={`wizard-selection-indicator ${indicatorClass} ${selected ? 'selected' : ''}`}>
                    {selected && selectionMode === 'multi' && '✓'}
                </div>

                <Stack gap="sm">
                    {/* Icon row with badges */}
                    <Stack direction="horizontal" align="center" gap="xs">
                        <PluginIcon
                            icon={icon}
                            iconType={iconType}
                            iconPath={iconPath}
                            size="medium"
                        />
                        {isPremium && <PremiumBadge />}
                        {hasConfig && <span className="wizard-config-badge">⚙️</span>}
                    </Stack>

                    {/* Title and description */}
                    <Heading level={4}>{title}</Heading>
                    {description && <Paragraph size="sm" muted>{description}</Paragraph>}
                </Stack>
            </Card>
        </div>
    );
};
