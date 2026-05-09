import React from 'react';

export interface DetailItem {
  emoji: string;
  text: string;
}

export const DetailList: React.FC<{ items: DetailItem[] }> = ({ items }) => (
  <div className="progress-details">
    {items.map((item, i) => (
      <div key={i} className="progress-detail-row">
        <span className="detail-emoji">{item.emoji}</span>
        {item.text}
      </div>
    ))}
  </div>
);
