import React from 'react';
import './DestinationPicker.css';

export interface DestinationChip {
  id: string;
  name: string;
  icon: string;
  rule?: string;
}

export interface DestinationPickerProps {
  destinations: DestinationChip[];
  onRemove: (id: string) => void;
  onAdd: () => void;
  onConfigure: (id: string) => void;
}

export const DestinationPicker: React.FC<DestinationPickerProps> = ({
  destinations,
  onRemove,
  onAdd,
  onConfigure,
}) => {
  return (
    <div className="dest-picker">
      {destinations.length > 0 && (
        <div className="dest-picker__chosen">
          {destinations.map((dest) => (
            <div key={dest.id} className="dest-chip">
              <div className="dest-chip__icon">{dest.icon}</div>
              <div className="dest-chip__main">
                <span className="dest-chip__name">{dest.name}</span>
                {dest.rule && (
                  <span className="dest-chip__rule">
                    rule: <code>{dest.rule}</code>
                  </span>
                )}
              </div>
              <div className="dest-chip__actions">
                <button
                  className="dest-chip__configure"
                  onClick={() => onConfigure(dest.id)}
                  type="button"
                >
                  CONFIGURE
                </button>
                <button
                  className="dest-chip__remove"
                  onClick={() => onRemove(dest.id)}
                  type="button"
                  aria-label={`Remove ${dest.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="dest-picker__add" onClick={onAdd} type="button">
        + ADD DESTINATION
      </button>
    </div>
  );
};
