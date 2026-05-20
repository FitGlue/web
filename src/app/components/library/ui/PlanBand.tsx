import React, { ReactNode } from 'react';
import './PlanBand.css';

export interface PlanBandProps {
  planName: string;
  price: string;
  period?: string;
  badge?: string;
  actions?: ReactNode;
}

export const PlanBand: React.FC<PlanBandProps> = ({
  planName,
  price,
  period,
  badge,
  actions,
}) => {
  return (
    <div className="plan-band">
      <div className="plan-band__left">
        <div className="plan-band__name">{planName}</div>
        {badge && <div className="plan-band__badge">{badge}</div>}
        {actions && <div className="plan-band__actions">{actions}</div>}
      </div>
      <div className="plan-band__right">
        <div className="plan-band__price">{price}</div>
        {period && <div className="plan-band__period">{period}</div>}
      </div>
    </div>
  );
};
