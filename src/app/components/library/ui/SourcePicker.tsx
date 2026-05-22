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
  selected?: string | null;
  selectedIds?: string[];
  multiSelect?: boolean;
  onSelect: (id: string) => void;
  label?: string;
}

export const SourcePicker: React.FC<SourcePickerProps> = ({
  sources,
  selected,
  selectedIds,
  multiSelect = false,
  onSelect,
  label,
}) => {
  return (
    <div className="source-picker">
      {label && <div className="source-picker__label">{label}</div>}
      <div className="source-picker__grid">
        {sources.map((source) => {
          const isSelected = multiSelect
            ? (selectedIds ?? []).includes(source.id)
            : selected === source.id;
          const classes = [
            'source-tile',
            isSelected ? 'source-tile--selected' : '',
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
              <div className="source-tile__icon-box">
                <span className="source-tile__icon">{source.icon}</span>
              </div>
              <div className="source-tile__text">
                <span className="source-tile__name">{source.name}</span>
                {source.meta && <span className="source-tile__meta">{source.meta}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
