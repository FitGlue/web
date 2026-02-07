import React from 'react';
import { Stack } from '../library/layout';
import { Paragraph, Text } from '../library/ui';
import { Input } from '../library/forms';
import { secondsToTime, timeToSeconds } from './helpers';

interface DurationInputProps {
    value: number; // Total seconds
    onChange: (seconds: number) => void;
    id?: string;
}

const DurationInput: React.FC<DurationInputProps> = ({ value, onChange, id }) => {
    const { hours, minutes, seconds } = secondsToTime(value);

    const handleChange = (field: 'hours' | 'minutes' | 'seconds', newValue: number) => {
        const updated = {
            hours: field === 'hours' ? newValue : hours,
            minutes: field === 'minutes' ? Math.min(59, newValue) : minutes,
            seconds: field === 'seconds' ? Math.min(59, newValue) : seconds,
        };
        onChange(timeToSeconds(updated.hours, updated.minutes, updated.seconds));
    };

    return (
        <Stack direction="horizontal" gap="xs" align="center">
            <Input
                id={id}
                type="number"
                min={0}
                max={99}
                value={hours}
                onChange={(e) => handleChange('hours', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Hours"
            />
            <Text variant="body">:</Text>
            <Input
                type="number"
                min={0}
                max={59}
                value={minutes.toString().padStart(2, '0')}
                onChange={(e) => handleChange('minutes', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Minutes"
            />
            <Text variant="body">:</Text>
            <Input
                type="number"
                min={0}
                max={59}
                value={seconds.toString().padStart(2, '0')}
                onChange={(e) => handleChange('seconds', parseInt(e.target.value) || 0)}
                style={{ width: '60px', textAlign: 'center' }}
                aria-label="Seconds"
            />
            <Paragraph size="sm" muted>(HH:MM:SS)</Paragraph>
        </Stack>
    );
};

export default DurationInput;
