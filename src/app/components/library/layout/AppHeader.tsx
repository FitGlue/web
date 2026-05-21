import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useUser } from '../../../hooks/useUser';
import { client } from '../../../../shared/api/client';
import { userAtom } from '../../../state/authState';
import { profilePictureUrlAtom } from '../../../state/userState';
import { getEffectiveTier, TIER_ATHLETE } from '../../../utils/tier';
import { AvatarMenu } from './AvatarMenu';
import { CommandPalette } from './CommandPalette';
import './AppHeader.css';

// Module-level flag — survives component remounts (page navigation)
let profilePicFetched = false;

const PRIMARY_NAV = [
    { key: 'dashboard',   label: 'Dashboard',   to: '/',                   end: true  },
    { key: 'pipelines',   label: 'Pipelines',   to: '/settings/pipelines', end: false },
    { key: 'activities',  label: 'Activities',  to: '/activities',          end: false },
    { key: 'connections', label: 'Connections', to: '/connections',         end: false },
    { key: 'recipes',     label: 'Recipes',     to: '/recipes',            end: false },
] as const;

export const AppHeader: React.FC = () => {
    const { user: profile, loading } = useUser();
    const [firebaseUser] = useAtom(userAtom);
    const [showMenu, setShowMenu] = useState(false);
    const [showPalette, setShowPalette] = useState(false);
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
                const { data } = await client.GET('/users/me/showcase-management/profile');
                const typedData = data as { profile: { profilePictureUrl?: string } | null };
                if (!cancelled && typedData.profile?.profilePictureUrl) {
                    setProfilePictureUrl(typedData.profile.profilePictureUrl);
                }
            } catch {
                profilePicFetched = false;
            }
        })();
        return () => { cancelled = true; };
    }, [isAthlete, setProfilePictureUrl]);

    // Close avatar menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    // ⌘K / Ctrl+K — open command palette from anywhere
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowPalette(true);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const getInitials = (): string => {
        if (loading && !firebaseUser) return '·';
        if (firebaseUser?.displayName) {
            const parts = firebaseUser.displayName.trim().split(/\s+/);
            return parts.length > 1
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : parts[0].slice(0, 2).toUpperCase();
        }
        if (firebaseUser?.email) return firebaseUser.email[0].toUpperCase();
        return '?';
    };

    const avatarStyle = useMemo(
        () => profilePictureUrl ? { backgroundImage: `url(${profilePictureUrl})` } : undefined,
        [profilePictureUrl]
    );

    const displayName = firebaseUser?.displayName || firebaseUser?.email || 'User';
    const email = firebaseUser?.email || '';
    const shortName = (firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User').toUpperCase();

    return (
        <>
            <header className="app-nav" role="banner">
                {/* Logo */}
                <Link to="/" className="app-nav__logo" aria-label="FitGlue — go to dashboard">
                    <span className="app-nav__logo-icon" aria-hidden="true" />
                    <span className="app-nav__logo-wordmark" aria-hidden="true">
                        <span className="app-nav__logo-fit">FIT</span>
                        <span className="app-nav__logo-glue">GLUE</span>
                    </span>
                </Link>

                {/* Primary destinations — 5 max */}
                <nav className="app-nav__primary" aria-label="Primary">
                    {PRIMARY_NAV.map(item => (
                        <NavLink
                            key={item.key}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right cluster */}
                <div className="app-nav__cluster">
                    {/* Search / command palette trigger */}
                    <button
                        className="app-nav__search"
                        onClick={() => setShowPalette(true)}
                        aria-label="Search"
                        aria-keyshortcuts="Meta+K Control+K"
                    >
                        <span className="app-nav__search-label">⌕ SEARCH</span>
                        <kbd className="app-nav__kbd">⌘K</kbd>
                    </button>

                    {/* Upload CTA — aurora gradient, always visible */}
                    <button className="app-nav__upload" aria-label="Upload activity files">
                        <span aria-hidden="true">↑</span> UPLOAD
                    </button>

                    {/* Notifications bell */}
                    <button
                        className="app-nav__notif"
                        aria-label="0 unread notifications"
                        aria-haspopup="true"
                    >
                        <span className="app-nav__bell" aria-hidden="true">🔔</span>
                    </button>

                    {/* Avatar trigger + menu */}
                    <div ref={menuRef} className="app-nav__avatar-zone">
                        <button
                            className={`app-nav__avatar-trigger${showMenu ? ' app-nav__avatar-trigger--open' : ''}`}
                            onClick={() => setShowMenu(v => !v)}
                            aria-label="User menu"
                            aria-expanded={showMenu}
                            aria-haspopup="dialog"
                        >
                            <div
                                className={`app-nav__avatar-img${profilePictureUrl ? ' app-nav__avatar-img--photo' : ''}`}
                                style={avatarStyle}
                                aria-hidden="true"
                            >
                                {!profilePictureUrl && getInitials()}
                            </div>
                            <div className="app-nav__avatar-meta" aria-hidden="true">
                                <span className="app-nav__avatar-name">{shortName}</span>
                                {isAthlete && (
                                    <span className="app-nav__avatar-plan">✦ ATHLETE</span>
                                )}
                            </div>
                            <span className="app-nav__avatar-caret" aria-hidden="true">▾</span>
                        </button>

                        {showMenu && (
                            <AvatarMenu
                                displayName={displayName}
                                email={email}
                                initials={getInitials()}
                                isAthlete={!!isAthlete}
                                isAdmin={!!profile?.isAdmin}
                                profilePictureUrl={profilePictureUrl || undefined}
                                syncsThisMonth={profile?.syncCountThisMonth}
                                onClose={() => setShowMenu(false)}
                            />
                        )}
                    </div>
                </div>
            </header>

            {showPalette && (
                <CommandPalette onClose={() => setShowPalette(false)} />
            )}
        </>
    );
};
