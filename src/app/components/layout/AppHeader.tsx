import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { userAtom } from '../../state/authState';

export const AppHeader: React.FC = () => {
    const [user] = useAtom(userAtom);
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
                </button>
                {showMenu && (
                    <div className="user-dropdown-menu">
                        <div className="user-dropdown-header">
                            <span className="user-email">{user?.email || 'User'}</span>
                        </div>
                        <div className="user-dropdown-divider" />
                        <Link to="/settings" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">⚙️</span>
                            Settings
                        </Link>
                        <Link to="/settings/integrations" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">🔗</span>
                            Integrations
                        </Link>
                        <Link to="/settings/pipelines" className="user-dropdown-item" onClick={() => setShowMenu(false)}>
                            <span className="dropdown-icon">🔀</span>
                            Pipelines
                        </Link>
                        <div className="user-dropdown-divider" />
                        <a href="/logout" className="user-dropdown-item user-dropdown-item-danger">
                            <span className="dropdown-icon">🚪</span>
                            Logout
                        </a>
                    </div>
                )}
            </div>
        </header>
    );
};
