import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AvatarMenu.css';

interface AvatarMenuProps {
    displayName: string;
    email: string;
    initials: string;
    isAthlete: boolean;
    isAdmin: boolean;
    profilePictureUrl?: string;
    syncsThisMonth?: number;
    onClose: () => void;
}

export const AvatarMenu: React.FC<AvatarMenuProps> = ({
    displayName,
    email,
    initials,
    isAthlete,
    isAdmin,
    profilePictureUrl,
    syncsThisMonth,
    onClose,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Focus trap + Esc to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            // ⌘, → open settings
            if ((e.metaKey || e.ctrlKey) && e.key === ',') {
                e.preventDefault();
                onClose();
                navigate('/settings/account');
            }
        };
        document.addEventListener('keydown', handleKey);
        // Focus the first focusable element
        const firstLink = menuRef.current?.querySelector<HTMLElement>('a, button');
        firstLink?.focus();
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose, navigate]);

    const handleItemClick = () => onClose();

    const planLabel = isAthlete ? 'ATHLETE PLAN' : 'HOBBYIST PLAN';
    const syncsLabel = syncsThisMonth !== undefined
        ? `${syncsThisMonth} SYNCS THIS MONTH`
        : null;

    return (
        <div
            ref={menuRef}
            className="avatar-menu"
            role="dialog"
            aria-label="User menu"
            aria-modal="true"
        >
            {/* Identity header — aurora wash (only decorative gradient use) */}
            <div className="avatar-menu__identity">
                <div
                    className={`avatar-menu__avatar${profilePictureUrl ? ' avatar-menu__avatar--photo' : ''}`}
                    style={profilePictureUrl ? { backgroundImage: `url(${profilePictureUrl})` } : undefined}
                    aria-hidden="true"
                >
                    {!profilePictureUrl && initials}
                </div>
                <div className="avatar-menu__identity-text">
                    <span className="avatar-menu__display-name">{displayName.toUpperCase()}</span>
                    <span className="avatar-menu__email">{email}</span>
                </div>
            </div>

            {/* Plan strip */}
            <div className="avatar-menu__plan">
                <div>
                    <div className="avatar-menu__plan-name">✦ {planLabel}</div>
                    {syncsLabel && (
                        <div className="avatar-menu__plan-meta">{syncsLabel}</div>
                    )}
                </div>
                <Link
                    to="/settings/subscription"
                    className="avatar-menu__plan-cta"
                    onClick={handleItemClick}
                >
                    MANAGE
                </Link>
            </div>

            {/* Account section */}
            <div className="avatar-menu__section">
                <div className="avatar-menu__section-label">ACCOUNT</div>
                {isAthlete && (
                    <Link to="/settings/showcase" className="avatar-menu__item" onClick={handleItemClick}>
                        <span className="avatar-menu__item-icon" aria-hidden="true">✦</span>
                        <span className="avatar-menu__item-label">My showcase</span>
                    </Link>
                )}
                <Link to="/settings/account" className="avatar-menu__item" onClick={handleItemClick}>
                    <span className="avatar-menu__item-icon" aria-hidden="true">◐</span>
                    <span className="avatar-menu__item-label">Profile</span>
                </Link>
                <Link to="/settings/account" className="avatar-menu__item" onClick={handleItemClick}>
                    <span className="avatar-menu__item-icon" aria-hidden="true">🔑</span>
                    <span className="avatar-menu__item-label">Authentication</span>
                </Link>
                {isAdmin && (
                    <Link to="/admin" className="avatar-menu__item" onClick={handleItemClick}>
                        <span className="avatar-menu__item-icon" aria-hidden="true">🛠</span>
                        <span className="avatar-menu__item-label">Admin console</span>
                    </Link>
                )}
            </div>

            {/* Preferences section */}
            <div className="avatar-menu__section">
                <div className="avatar-menu__section-label">PREFERENCES</div>
                <Link to="/settings/account" className="avatar-menu__item" onClick={handleItemClick}>
                    <span className="avatar-menu__item-icon" aria-hidden="true">⚙</span>
                    <span className="avatar-menu__item-label">Settings</span>
                    <span className="avatar-menu__item-hint">⌘,</span>
                </Link>
                <Link to="/settings/enricher-data" className="avatar-menu__item" onClick={handleItemClick}>
                    <span className="avatar-menu__item-icon" aria-hidden="true">📊</span>
                    <span className="avatar-menu__item-label">Booster data</span>
                </Link>
            </div>

            {/* Support section */}
            <div className="avatar-menu__section">
                <div className="avatar-menu__section-label">SUPPORT</div>
                <a href="/help" className="avatar-menu__item" onClick={handleItemClick}>
                    <span className="avatar-menu__item-icon" aria-hidden="true">?</span>
                    <span className="avatar-menu__item-label">Help &amp; docs</span>
                </a>
            </div>

            {/* Footer — sign out */}
            <div className="avatar-menu__footer">
                <a
                    href="/auth/logout"
                    className="avatar-menu__item avatar-menu__item--danger"
                >
                    <span className="avatar-menu__item-icon" aria-hidden="true">⏏</span>
                    <span className="avatar-menu__item-label">Sign out</span>
                </a>
            </div>
        </div>
    );
};
