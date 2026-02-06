import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
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
        <div className="pwa-install-banner">
            <div className="pwa-install-banner-content">
                <div className="pwa-install-banner-info">
                    <span className="pwa-install-banner-icon">📲</span>
                    <div className="pwa-install-banner-text">
                        <h4>Install FitGlue</h4>
                        <p>Add to your home screen for quick access</p>
                    </div>
                </div>
                <div className="pwa-install-banner-actions">
                    <button className="pwa-install-btn" onClick={handleInstall}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Install
                    </button>
                    <button
                        className="pwa-dismiss-btn"
                        onClick={dismissForMonth}
                        aria-label="Dismiss for 30 days"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallBanner;
