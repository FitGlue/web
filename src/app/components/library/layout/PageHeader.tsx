import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

interface PageHeaderProps {
    title: string | ReactNode;
    actions?: ReactNode;
    backTo?: string;
    backLabel?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actions, backTo, backLabel }) => {
    return (
        <div className="page-header">
            <div className="page-header-left">
                {backTo && (
                    <Link to={backTo} className="back-link">
                        ← {backLabel || 'Back'}
                    </Link>
                )}
                <div className="page-header-title">
                    {typeof title === 'string' ? <h2>{title}</h2> : title}
                </div>
            </div>
            <div className="page-header-actions">
                {actions}
            </div>
        </div>
    );
};
