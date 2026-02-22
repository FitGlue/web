import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useUser } from '../../../hooks/useUser';
import { useApi } from '../../../hooks/useApi';
import { userAtom } from '../../../state/authState';
import { profilePictureUrlAtom } from '../../../state/userState';
import { getEffectiveTier, TIER_ATHLETE } from '../../../utils/tier';
import './AppHeader.css';

// Module-level flag — survives component remounts (page navigation)
let profilePicFetched = false;

export const AppHeader: React.FC = () => {
    const { user: profile, loading } = useUser();
    const api = useApi();
    const [firebaseUser] = useAtom(userAtom);
    const [showMenu, setShowMenu] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useAtom(profilePictureUrlAtom);

    const menuRef = useRef<HTMLDivElement>(null);

    const isAthlete = profile && getEffectiveTier(profile) === TIER_ATHLETE;

    // Fetch profile picture for Athlete users — only once across all mounts
    useEffect(() => {
        if (!isAthlete || profilePicFetched) return;
        profilePicFetched = true;
        let cancelled = false;
        (async () => {
            try {
                const data = await api.get('/showcase-management/profile') as {
                    profile: { profilePictureUrl?: string } | null;
                };
                if (!cancelled) {
                    if (data.profile?.profilePictureUrl) {
                        setProfilePictureUrl(data.profile.profilePictureUrl);
                    }
                }
            } catch {
                // Non-critical — reset flag so next render retries
                profilePicFetched = false;
            }
        })();
        return () => { cancelled = true; };
    }, [api, isAthlete, setProfilePictureUrl]);

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


    // Memoize avatar style to prevent re-applying backgroundImage on every render
    const avatarStyle = useMemo(
        () => profilePictureUrl ? { backgroundImage: `url(${profilePictureUrl})` } : undefined,
        [profilePictureUrl]
    );

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
                    className={`app-header__avatar${profilePictureUrl ? ' app-header__avatar--has-image' : ''}`}
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="User menu"
                    aria-expanded={showMenu}
                    style={avatarStyle}
                >
                    {!profilePictureUrl && getInitial()}
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
                        <Link
                            to="/recipes"
                            className="app-header__dropdown-item"
                            onClick={() => setShowMenu(false)}
                        >
                            <span className="app-header__dropdown-icon">🧪</span>
                            Recipes
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
