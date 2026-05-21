import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartNudges } from '../../hooks/useSmartNudges';
import { DashboardBand } from '../library/ui/DashboardBand';

export const RecipeSection: React.FC = () => {
    const navigate = useNavigate();
    const nudge = useSmartNudges('dashboard');

    if (!nudge) return null;

    return (
        <>
            <DashboardBand label="💡 Recipe For You" right="1 NEW" />
            <div className="recipe-panel">
                <div className="recipe-panel__head">
                    <span className="recipe-panel__icon">{nudge.icon}</span>
                    <span className="recipe-panel__title">{nudge.title}</span>
                </div>
                <div className="recipe-panel__desc">{nudge.description}</div>
                <div className="recipe-panel__cta">
                    <button
                        className="fg-button fg-button--sm"
                        onClick={() => navigate('/recipes')}
                    >
                        BROWSE RECIPES →
                    </button>
                </div>
            </div>
        </>
    );
};
