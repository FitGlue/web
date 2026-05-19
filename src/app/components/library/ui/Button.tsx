import React, { ReactNode, ButtonHTMLAttributes } from 'react';

// Variants map to fg-button modifier classes in app-components.css.
// 'secondary' and 'secondary-light' are legacy aliases for 'outline'.
// 'text' is a legacy alias for 'ghost'.
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'ink' | 'paper' | 'secondary' | 'secondary-light' | 'text';
type ButtonSize = 'sm' | 'default' | 'small' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    fullWidth?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary:         '',
    outline:         'fg-button--outline',
    ghost:           'fg-button--ghost',
    danger:          'fg-button--danger',
    ink:             'fg-button--ink',
    paper:           'fg-button--paper',
    secondary:       'fg-button--outline',
    'secondary-light': 'fg-button--ghost',
    text:            'fg-button--ghost',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'default',
    fullWidth = false,
    children,
    className = '',
    ...props
}) => {
    const modifiers = [
        VARIANT_CLASS[variant],
        (size === 'sm' || size === 'small') ? 'fg-button--sm' : '',
        (size === 'large') ? 'fg-button--lg' : '',
        fullWidth ? 'fg-button--full' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button className={`fg-button ${modifiers}`.trimEnd()} {...props}>
            {children}
        </button>
    );
};
