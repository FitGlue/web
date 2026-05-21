import React, { ReactNode } from 'react';
import './PageAction.css';

export type PageActionTone = 'primary' | 'secondary' | 'more';

export interface PageActionProps {
    /** primary = aurora fill · secondary = ghost outline · more = ⋯ overflow button */
    tone?: PageActionTone;
    /** Renders label + border in rose (destructive actions). Pair with secondary tone. */
    danger?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
    'aria-label'?: string;
    children?: ReactNode;
}

export const PageAction: React.FC<PageActionProps> = ({
    tone = 'secondary',
    danger = false,
    onClick,
    disabled,
    type = 'button',
    children,
    'aria-label': ariaLabel,
}) => {
    if (tone === 'more') {
        return (
            <button
                type={type}
                className="page-action page-action--more"
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel ?? 'More options'}
                aria-haspopup="menu"
            >
                ⋯
            </button>
        );
    }

    return (
        <button
            type={type}
            className={[
                'page-action',
                `page-action--${tone}`,
                danger ? 'page-action--danger' : '',
            ].filter(Boolean).join(' ')}
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
};
