import React, { forwardRef, InputHTMLAttributes } from 'react';
import './RangeSlider.css';

export interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    /** Optional label displayed before the slider */
    label?: string;
    /** Show the current numeric value */
    showValue?: boolean;
    /** Format the displayed value */
    formatValue?: (value: number) => string;
}

/**
 * RangeSlider - A styled range input for numeric values.
 * Features a custom track and thumb with gradient accent styling.
 */
export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(({
    label,
    showValue = false,
    formatValue,
    className = '',
    value,
    ...props
}, ref) => {
    const classes = [
        'form-range-slider',
        className,
    ].filter(Boolean).join(' ');

    const displayValue = showValue && value !== undefined
        ? (formatValue ? formatValue(Number(value)) : String(value))
        : null;

    return (
        <div className="form-range-slider__wrapper">
            {label && (
                <span className="form-range-slider__label">{label}</span>
            )}
            <input
                ref={ref}
                type="range"
                className={classes}
                value={value}
                {...props}
            />
            {displayValue && (
                <span className="form-range-slider__value">{displayValue}</span>
            )}
        </div>
    );
});

RangeSlider.displayName = 'RangeSlider';

export default RangeSlider;
