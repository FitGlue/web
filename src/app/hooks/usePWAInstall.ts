import { useState, useEffect, useCallback } from 'react';

const DISMISSED_KEY = 'fitglue_pwa_install_dismissed';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallResult {
    /** Whether the app can be installed (event captured and not dismissed recently) */
    canInstall: boolean;
    /** Whether the app is already installed / running in standalone mode */
    isInstalled: boolean;
    /** Trigger the native install prompt */
    promptInstall: () => Promise<boolean>;
    /** Dismiss the install prompt for 30 days */
    dismissForMonth: () => void;
}

/**
 * Hook to manage PWA installation prompts.
 * Captures the `beforeinstallprompt` event, detects standalone mode,
 * and manages a 30-day dismissal cooldown.
 */
export function usePWAInstall(): UsePWAInstallResult {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Check if running in standalone mode (already installed)
    useEffect(() => {
        const checkStandalone = () => {
            const isStandalone =
                window.matchMedia('(display-mode: standalone)').matches ||
                // iOS Safari standalone detection
                (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
            setIsInstalled(isStandalone);
        };

        checkStandalone();

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Check dismissal state from localStorage
    useEffect(() => {
        const dismissedAt = localStorage.getItem(DISMISSED_KEY);
        if (dismissedAt) {
            const timestamp = parseInt(dismissedAt, 10);
            const elapsed = Date.now() - timestamp;
            if (elapsed < THIRTY_DAYS_MS) {
                setIsDismissed(true);
            } else {
                // Cooldown expired, clear the stored value
                localStorage.removeItem(DISMISSED_KEY);
            }
        }
    }, []);

    // Capture the beforeinstallprompt event
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            console.log('[PWA Install] beforeinstallprompt event captured');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        console.log('[PWA Install] Listening for beforeinstallprompt event...');

        // Also listen for successful app install
        const handleAppInstalled = () => {
            console.log('[PWA Install] App installed!');
            setDeferredPrompt(null);
            setIsInstalled(true);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = useCallback(async (): Promise<boolean> => {
        console.log('[PWA Install] Install button clicked, deferredPrompt:', deferredPrompt);
        if (!deferredPrompt) {
            console.log('[PWA Install] No deferred prompt available');
            return false;
        }

        try {
            console.log('[PWA Install] Calling prompt()...');
            await deferredPrompt.prompt();
            console.log('[PWA Install] Waiting for user choice...');
            const { outcome } = await deferredPrompt.userChoice;
            console.log('[PWA Install] User choice:', outcome);

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[PWA Install] Error during prompt:', error);
            return false;
        }
    }, [deferredPrompt]);

    const dismissForMonth = useCallback(() => {
        localStorage.setItem(DISMISSED_KEY, Date.now().toString());
        setIsDismissed(true);
    }, []);

    // Can install if: we have a prompt, not already installed, and not recently dismissed
    const canInstall = deferredPrompt !== null && !isInstalled && !isDismissed;

    return {
        canInstall,
        isInstalled,
        promptInstall,
        dismissForMonth,
    };
}
