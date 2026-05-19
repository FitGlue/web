import React from 'react';
import './SourcePicker.css';

export interface SourceTile {
  id: string;
  name: string;
  icon: string;
  connected?: boolean;
  disabled?: boolean;
  meta?: string;
}

export interface SourcePickerProps {
  sources: SourceTile[];
  selected: string | null;
  onSelect: (id: string) => void;
  label?: string;
}

export const SourcePicker: React.FC<SourcePickerProps> = ({
  sources,
  selected,
  onSelect,
  label,
}) => {
  return (
    <div className="source-picker">
      {label && <div className="source-picker__label">{label}</div>}
      <div className="source-picker__grid">
        {sources.map((source) => {
          const isSelected = selected === source.id;
          const classes = [
            'source-tile',
            isSelected ? 'source-tile--selected' : '',
            source.connected ? 'source-tile--connected' : '',
            source.disabled ? 'source-tile--disabled' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={source.id}
              className={classes}
              onClick={() => !source.disabled && onSelect(source.id)}
              type="button"
              disabled={source.disabled}
            >
              <span className="source-tile__icon">{source.icon}</span>
              <span className="source-tile__name">{source.name}</span>
              {source.meta && <span className="source-tile__meta">{source.meta}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
