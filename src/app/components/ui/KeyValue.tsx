import React from 'react';

type FormatType = 'text' | 'datetime' | 'date' | 'code';

interface KeyValueProps {
    /** Label for the value */
    label: string;
    /** The value to display */
    value: string | number | null | undefined;
    /** How to format the value */
    format?: FormatType;
    /** Display value on multiple lines */
    multiline?: boolean;
}

/**
 * KeyValue displays a label: value pair consistently.
 */
export const KeyValue: React.FC<KeyValueProps> = ({
    label,
    value,
    format = 'text',
    multiline = false
}) => {
    const formatValue = () => {
        if (value === null || value === undefined) return 'N/A';

        switch (format) {
            case 'datetime':
                return new Date(value as string | number).toLocaleString();
            case 'date':
                return new Date(value as string | number).toLocaleDateString();
            case 'code':
                return <code>{value}</code>;
            default:
                return String(value);
        }
    };

    if (multiline) {
        return (
            <div className="key-value key-value-multiline">
                <p><strong>{label}:</strong></p>
                <p className="key-value-content">{formatValue()}</p>
            </div>
        );
    }

    return (
        <p className="key-value">
            <strong>{label}:</strong> {formatValue()}
        </p>
    );
};
