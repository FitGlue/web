import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useUser } from '../../../hooks/useUser';
import { userAtom } from '../../../state/authState';
import { getEffectiveTier, TIER_ATHLETE } from '../../../utils/tier';
import './AppHeader.css';


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

    const isAthlete = profile && getEffectiveTier(profile) === TIER_ATHLETE;


    return (
        <header className="app-header">
            <Link to="/" className="app-header__logo-link">
                <h1 className="app-header__logo">
                    <span className="app-header__logo-fit">Fit</span>
                    <span className="app-header__logo-glue">Glue</span>
                </h1>
            </Link>
            <div ref={menuRef} className="app-header__user-menu">
                <button
                    className="app-header__avatar"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="User menu"
                    aria-expanded={showMenu}
                >
                    {getInitial()}
                    {isAthlete && (
                        <span className="app-header__tier-badge">ATHLETE</span>
                    )}
                </button>

                {showMenu && (
                    <div className="app-header__dropdown">
                        <div className="app-header__dropdown-header">
                            <span className="app-header__dropdown-email">
                                {firebaseUser?.displayName || firebaseUser?.email || 'User'}
                            </span>
                        </div>
                        <div className="app-header__dropdown-divider" />
                        <Link
                            to="/settings/account"
                            className="app-header__dropdown-item"
                            onClick={() => setShowMenu(false)}
                        >
                            <span className="app-header__dropdown-icon">👤</span>
                            Account
                        </Link>
                        <Link
                            to="/settings/enricher-data"
                            className="app-header__dropdown-item"
                            onClick={() => setShowMenu(false)}
                        >
                            <span className="app-header__dropdown-icon">📊</span>
                            Booster Data
                        </Link>
                        {isAthlete && (
                            <Link
                                to="/settings/showcase"
                                className="app-header__dropdown-item"
                                onClick={() => setShowMenu(false)}
                            >
                                <span className="app-header__dropdown-icon">🌟</span>
                                Manage Showcase
                            </Link>
                        )}
                        {profile?.isAdmin && (
                            <Link
                                to="/admin"
                                className="app-header__dropdown-item"
                                onClick={() => setShowMenu(false)}
                            >
                                <span className="app-header__dropdown-icon">🛠️</span>
                                Admin Console
                            </Link>
                        )}
                        <a
                            href="/help"
                            className="app-header__dropdown-item"
                            onClick={() => setShowMenu(false)}
                        >
                            <span className="app-header__dropdown-icon">📚</span>
                            Help
                        </a>
                        <div className="app-header__dropdown-divider" />
                        <a
                            href="/auth/logout"
                            className="app-header__dropdown-item app-header__dropdown-item--danger"
                        >
                            <span className="app-header__dropdown-icon">🚪</span>
                            Logout
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};
