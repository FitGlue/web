import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Card } from '../library/ui/Card';
import { Stack } from '../library/layout/Stack';
import { Heading } from '../library/ui/Heading';
import { Paragraph } from '../library/ui/Paragraph';
import { Button } from '../library/ui/Button';
import './PWAInstallBanner.css';

/**
 * Standalone PWA install banner shown when the WelcomeBanner is not displayed.
 * Dismissable with a 30-day cooldown.
 */
export const PWAInstallBanner: React.FC = () => {
    const { canInstall, promptInstall, dismissForMonth } = usePWAInstall();

    if (!canInstall) {
        return null;
    }

    const handleInstall = async () => {
        await promptInstall();
    };

    return (
        <Card className="pwa-install-banner">
            <Stack direction="horizontal" className="pwa-install-banner-content" align="center" justify="between">
                <Stack direction="horizontal" className="pwa-install-banner-info" gap="sm" align="center">
                    <Paragraph inline className="pwa-install-banner-icon">📲</Paragraph>
                    <Stack className="pwa-install-banner-text" gap="xs">
                        <Heading level={4}>Install FitGlue</Heading>
                        <Paragraph size="sm">Add to your home screen for quick access</Paragraph>
                    </Stack>
                </Stack>
                <Stack direction="horizontal" className="pwa-install-banner-actions" gap="xs">
                    <Button className="pwa-install-btn" onClick={handleInstall} variant="primary" size="small">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Install
                    </Button>
                    <Button
                        className="pwa-dismiss-btn"
                        onClick={dismissForMonth}
                        aria-label="Dismiss for 30 days"
                        variant="text"
                        size="small"
                    >
                        ✕
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
};

export default PWAInstallBanner;
