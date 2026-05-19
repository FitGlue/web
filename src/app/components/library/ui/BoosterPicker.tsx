import React from 'react';
import './BoosterPicker.css';

export interface BoosterChip {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface BoosterPickerProps {
  boosters: BoosterChip[];
  selected: string[];
  onToggle: (id: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const BoosterPicker: React.FC<BoosterPickerProps> = ({
  boosters,
  selected,
  onToggle,
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const visibleBoosters = activeCategory === 'ALL'
    ? boosters
    : boosters.filter(b => b.category === activeCategory);

  return (
    <div className="booster-picker">
      <div className="booster-picker__tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`booster-picker__tab${activeCategory === cat ? ' booster-picker__tab--active' : ''}`}
            onClick={() => onCategoryChange(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="booster-picker__grid">
        {visibleBoosters.map((booster) => {
          const isOn = selected.includes(booster.id);
          return (
            <button
              key={booster.id}
              className={`booster-chip${isOn ? ' booster-chip--on' : ''}`}
              onClick={() => onToggle(booster.id)}
              type="button"
            >
              <span className="booster-chip__icon">{booster.icon}</span>
              <span className="booster-chip__name">{booster.name}</span>
              <span className="booster-chip__add">{isOn ? '✓' : '+'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
