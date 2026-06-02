import React from 'react';
import './DestinationEnricherExclusion.css';

export interface EnricherExclusionItem {
    key: string;
    name: string;
    icon: string;
}

interface Props {
    enrichers: EnricherExclusionItem[];
    excludedEnrichers: string[];
    onChange: (excluded: string[]) => void;
    standalone?: boolean;
}

export const DestinationEnricherExclusion: React.FC<Props> = ({
    enrichers,
    excludedEnrichers,
    onChange,
    standalone = false,
}) => {
    if (enrichers.length === 0) return null;

    const toggle = (key: string) => {
        if (excludedEnrichers.includes(key)) {
            onChange(excludedEnrichers.filter(k => k !== key));
        } else {
            onChange([...excludedEnrichers, key]);
        }
    };

    return (
        <div className={`dest-excl${standalone ? ' dest-excl--standalone' : ''}`}>
            <div className="wiz__sec-label">BOOSTER OUTPUT</div>
            <p className="dest-excl__hint">
                Control which boosters contribute to the description sent to this destination. All on by default.
            </p>
            <div className="dest-excl__list">
                {enrichers.map(e => {
                    const isOn = !excludedEnrichers.includes(e.key);
                    return (
                        <div key={e.key} className="dest-excl__row">
                            <span className="dest-excl__icon">{e.icon}</span>
                            <span className="dest-excl__name">{e.name}</span>
                            <button
                                type="button"
                                className={`dest-excl__tog${isOn ? ' dest-excl__tog--on' : ''}`}
                                onClick={() => toggle(e.key)}
                                aria-label={`${isOn ? 'Exclude' : 'Include'} ${e.name} in description`}
                                aria-pressed={isOn}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
