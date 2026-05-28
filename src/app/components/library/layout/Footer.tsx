import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="footer-version">FitGlue {import.meta.env.VITE_APP_VERSION || 'vS0.0.0-W0.0.0'}</span>
                    <a href="/changelog" className="changelog-link" target="_blank" rel="noopener noreferrer">What&apos;s New</a>
                </div>
            </div>
        </footer>
    );
};
