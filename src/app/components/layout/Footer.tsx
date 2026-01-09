import React from 'react';
import { useNerdMode } from '../../state/NerdModeContext';

export const Footer: React.FC = () => {
    const { isNerdMode, toggleNerdMode } = useNerdMode();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <span className="version">FitGlue Web v{import.meta.env.VITE_APP_VERSION || '0.0.0'}</span>
                </div>
                <div className="footer-right">
                    <label className="switch-label">
                        <span className="label-text">Nerd Mode</span>
                        <input
                            type="checkbox"
                            checked={isNerdMode}
                            onChange={toggleNerdMode}
                            className="toggle-switch"
                        />
                    </label>
                </div>
            </div>
            <style>{`
                .app-footer {
                    margin-top: 3rem;
                    padding: 1.5rem 0;
                    border-top: 1px solid var(--border-color);
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                .footer-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .switch-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    user-select: none;
                }
                /* Simple Toggle Switch CSS */
                .toggle-switch {
                    appearance: none;
                    width: 44px;
                    height: 24px;
                    background: #333;
                    border: 2px solid #555;
                    border-radius: 24px;
                    position: relative;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    margin: 0;
                }
                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: #666;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                .toggle-switch:checked {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                }
                .toggle-switch:checked::after {
                    transform: translateX(20px);
                    background: white;
                }
            `}</style>
        </footer>
    );
};
