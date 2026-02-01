import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useUser } from '../../../hooks/useUser';
import { userAtom } from '../../../state/authState';
import { getEffectiveTier, TIER_ATHLETE } from '../../../utils/tier';

export const AppHeader: React.FC = () => {
    const { user: profile, loading } = useUser();
    const [firebaseUser] = useAtom(userAtom);
    const [showMenu, setShowMenu] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Get user initials - prefer displayName, fallback to email
    const getInitial = () => {
        // Show loading indicator while user is being fetched
        if (loading && !firebaseUser) return '·';

        // Try displayName first (from Firebase Auth)
        if (firebaseUser?.displayName) {
            return firebaseUser.displayName[0].toUpperCase();
        }
        // Fallback to email
        if (firebaseUser?.email) {
            return firebaseUser.email[0].toUpperCase();
        }
        return '?';
    };

    return (
        <header className="app-header-global">
            <Link to="/" className="logo-link">
                <h1 className="title small">
                    <span className="fit">Fit</span><span className="glue">Glue</span>
                </h1>
            </Link>
            <div ref={menuRef} className="user-menu-container">
                <button
                    className="user-avatar-button"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="User menu"
                    aria-expanded={showMenu}
                >
                    {getInitial()}
                    {profile && getEffectiveTier(profile) === TIER_ATHLETE && (
                        <div style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: '-4px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            fontSize: '0.6rem',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '2px solid var(--color-bg)'
                        }}>
                            ATHLETE
                        </div>
                    )}
                </button>

                {showMenu && (
                    <div className="user-dropdown-menu">
                        <div className="user-dropdown-header">
                            <span className="user-email">{firebaseUser?.displayName || firebaseUser?.email || 'User'}</span>
                        </div>
                        <div className="user-dropdown-divider" />
                        <Link to="/settings/account" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">👤</span>
                            Account
                        </Link>
                        <Link to="/settings/enricher-data" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">📊</span>
                            Booster Data
                        </Link>
                        {profile?.isAdmin && (
                            <Link to="/admin" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                                <span className="dropdown-icon">🛠️</span>
                                Admin Console
                            </Link>
                        )}
                        <div className="user-dropdown-divider" />

                        <a href="/auth/logout" className="user-dropdown-item user-dropdown-item-danger">
                            <span className="dropdown-icon">🚪</span>
                            Logout
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};
