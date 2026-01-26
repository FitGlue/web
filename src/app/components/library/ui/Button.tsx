import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'secondary-light' | 'text' | 'danger';
type ButtonSize = 'small' | 'default' | 'large';

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
    ...props
}) => {
    const sizeClass = size !== 'default' ? size : '';
    const widthClass = fullWidth ? 'full-width' : '';

    return (
        <button
            className={`btn ${variant} ${sizeClass} ${widthClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
};
