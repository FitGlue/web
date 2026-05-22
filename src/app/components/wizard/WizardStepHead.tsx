import React from 'react';
import './WizardStepHead.css';

export interface WizardStepHeadProps {
    step: number;
    total: number;
    /** Section label text after the step counter, e.g. "SOURCE" or "BOOSTERS · 5 ACTIVE" */
    section: React.ReactNode;
    /** Title — use a <span className="gr"> for the gradient last word */
    title: React.ReactNode;
    description: React.ReactNode;
}

export const WizardStepHead: React.FC<WizardStepHeadProps> = ({
    step,
    total,
    section,
    title,
    description,
}) => (
    <div className="wiz-step-head">
        <div className="wiz-step-head__crumb">
            STEP <b>{step} OF {total}</b> · {section}
        </div>
        <h1 className="wiz-step-head__title">{title}</h1>
        <p className="wiz-step-head__desc">{description}</p>
    </div>
);
