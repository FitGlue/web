import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './OverflowMenu.css';

export interface OverflowMenuItem {
    key: string;
    icon?: string;
    label: string;
    hint?: string;
    href?: string;
    onClick?: () => void;
    danger?: boolean;
    disabled?: boolean;
}

export interface OverflowMenuProps {
    items: OverflowMenuItem[];
    onClose: () => void;
    /** Optional className for positioning via a parent's relative container. */
    className?: string;
}

export const OverflowMenu: React.FC<OverflowMenuProps> = ({ items, onClose, className }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className={`overflow-menu${className ? ` ${className}` : ''}`}
            role="menu"
            aria-label="More options"
        >
            {items.map(item => {
                const classes = [
                    'overflow-menu__item',
                    item.danger    ? 'overflow-menu__item--danger'   : '',
                    item.disabled  ? 'overflow-menu__item--disabled' : '',
                ].filter(Boolean).join(' ');

                const inner = (
                    <>
                        {item.icon && (
                            <span className="overflow-menu__icon" aria-hidden="true">{item.icon}</span>
                        )}
                        <span className="overflow-menu__label">{item.label}</span>
                        {item.hint && (
                            <span className="overflow-menu__hint">{item.hint}</span>
                        )}
                    </>
                );

                if (item.href && !item.disabled) {
                    return (
                        <Link
                            key={item.key}
                            to={item.href}
                            className={classes}
                            role="menuitem"
                            onClick={onClose}
                        >
                            {inner}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.key}
                        className={classes}
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={() => {
                            if (!item.disabled) {
                                onClose();
                                item.onClick?.();
                            }
                        }}
                    >
                        {inner}
                    </button>
                );
            })}
        </div>
    );
};
