import React, { useState, useEffect } from 'react';
import './AppLoadingScreen.css';

// Sims-style rotating jokey fitness messages
const LOADING_MESSAGES = [
    'Reticulating muscle fibers...',
    'Calibrating sweat glands...',
    'Polishing your running shoes...',
    'Stretching the pixels...',
    'Syncing your chakras...',
    'Buffering endorphins...',
    'Warming up the algorithms...',
    'Hydrating the database...',
    'Massaging the data points...',
    'Doing some light cardio...',
    'Flexing the API...',
    'Counting backwards from 10...',
    'Foam rolling the server...',
    'Adjusting seat to upright position...',
    'Untangling your headphones...',
    'Finding your gym buddy...',
    'Motivating the backend...',
    'Applying anti-chafe cream...',
    'Loading protein shakes...',
    'Activating beast mode...',
];

interface AppLoadingScreenProps {
    /** Optional override for messages (shows static if provided) */
    staticMessage?: string;
}

/**
 * A premium full-screen loading experience with animated FitGlue branding
 * and Sims-style rotating humorous fitness messages.
 */
export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
    staticMessage
}) => {
    const [messageIndex, setMessageIndex] = useState(() =>
        Math.floor(Math.random() * LOADING_MESSAGES.length)
    );

    useEffect(() => {
        if (staticMessage) return; // Don't rotate if static message provided

        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [staticMessage]);

    const displayMessage = staticMessage || LOADING_MESSAGES[messageIndex];

    return (
        <div className="app-loading-screen">
            {/* Animated background gradient */}
            <div className="loading-bg-gradient" />

            {/* Centered content */}
            <div className="loading-content">
                {/* Animated logo */}
                <div className="loading-logo">
                    <span className="loading-logo-fit">Fit</span>
                    <span className="loading-logo-glue">Glue</span>
                </div>

                {/* Premium spinner */}
                <div className="loading-spinner-container">
                    <div className="loading-spinner">
                        <div className="loading-spinner-ring" />
                        <div className="loading-spinner-ring loading-spinner-ring-2" />
                        <div className="loading-spinner-ring loading-spinner-ring-3" />
                    </div>
                </div>

                {/* Rotating message */}
                <p className="loading-message" key={messageIndex}>
                    {displayMessage}
                </p>
            </div>
        </div>
    );
};
