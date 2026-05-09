import React from 'react';
import type { DescriptionSection } from '../DescriptionSections';
import { SectionCard } from '../SectionCard';

export const ConditionsSection: React.FC<{ section: DescriptionSection; idx: number }> = ({ section, idx }) => {
  const items: Array<{ icon: string; value: string; label: string }> = [];

  if (section._location) {
    const locText = section._location.content.trim();
    const locMatch = locText.match(/^(.+?)\s*\((.+)\)$/);
    if (locMatch) items.push({ icon: '📍', value: locMatch[1], label: locMatch[2] });
    else items.push({ icon: '📍', value: locText, label: 'Location' });
  }

  if (section._weather) {
    const wxParts = section._weather.content.trim().split(' • ').map((p) => p.trim());
    for (const p of wxParts) {
      const ci = p.indexOf(':');
      if (ci > 0) items.push({ icon: '💨', value: p.substring(ci + 1).trim(), label: p.substring(0, ci).trim() });
      else items.push({ icon: '🌡️', value: p, label: 'Weather' });
    }
  }

  return (
    <SectionCard section={section} idx={idx}>
      <div className="conditions-row">
        {items.map((item, i) => (
          <div key={i} className="conditions-item">
            <span className="conditions-icon">{item.icon}</span>
            <div className="conditions-text">
              <span className="conditions-value">{item.value}</span>
              <span className="conditions-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};
