import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';

export const AppHeader: React.FC = () => {
    const { user } = useUser();
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

    // Get user initials or first letter of email
    const getInitial = () => {
        if (!user?.email) return '?';
        return user.email[0].toUpperCase();
    };

    return (
        <header className="app-header-global">
            <Link to="/" className="logo-link">
                <h1 className="title small">
                    <span className="fit">Fit</span><span className="glue">Glue</span>
                </h1>
            </Link>
            <div className="user-menu-container" ref={menuRef}>
                <button
                    className="user-avatar-button"
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="User menu"
                    aria-expanded={showMenu}
                >
                    {getInitial()}
                    {user?.tier === 'pro' && (
                        <div className="pro-badge-mini" style={{
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
                            PRO
                        </div>
                    )}
                </button>

                {showMenu && (
                    <div className="user-dropdown-menu">
                        <div className="user-dropdown-header">
                            <span className="user-email">{user?.email || 'User'}</span>
                        </div>
                        <div className="user-dropdown-divider" />
                        <Link to="/settings/account" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">👤</span>
                            Account
                        </Link>
                        {user?.isAdmin && (
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
