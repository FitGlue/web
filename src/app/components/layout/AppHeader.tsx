import React from 'react';
import { Link } from 'react-router-dom';

export const AppHeader: React.FC = () => {
    return (
        <header className="app-header-global">
             <Link to="/" className="logo-link">
                <h1 className="title small">
                    <span className="fit">Fit</span><span className="glue">Glue</span>
                </h1>
            </Link>
        </header>
    );
};
