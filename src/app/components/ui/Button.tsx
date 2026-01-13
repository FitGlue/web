import React, { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';
type ButtonSize = 'small' | 'default';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button style variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Button content */
    children: ReactNode;
    /** Full width button */
    fullWidth?: boolean;
}

/**
 * Button component with consistent styling variants.
 */
export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'default',
    fullWidth = false,
    children,
    className = '',
    style,
    ...props
}) => {
    const variantClass = variant === 'danger'
        ? 'text' // Use text style but with danger color override
        : variant;

    const sizeClass = size === 'small' ? 'small' : '';

    const widthStyle = fullWidth ? { width: '100%' } : {};
    const dangerStyle = variant === 'danger' ? { color: '#d32f2f' } : {};

    return (
        <button
            className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
            style={{ ...widthStyle, ...dangerStyle, ...style }}
            {...props}
        >
            {children}
        </button>
    );
};
