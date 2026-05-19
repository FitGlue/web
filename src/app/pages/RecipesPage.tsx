import React from 'react';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES } from '../data/recipes';
import './RecipesPage.css';

const RecipesPage: React.FC = () => {
    const { integrations } = useRealtimeIntegrations();

    return (
        <div className="recipes-page">
            {/* Page head */}
            <div className="page-head">
                <div>
                    <div className="page-head__eyebrow">SETUP</div>
                    <h1>Recipes</h1>
                </div>
            </div>

            {/* Band */}
            <div className="fg-band">
                <span className="fg-band__label">PIPELINE RECIPES</span>
                <span className="fg-band__right">ONE-CLICK SETUPS</span>
            </div>

            {/* Recipe list */}
            <div className="recipes-page__list">
                {RECIPES.map(recipe => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        integrations={integrations}
                    />
                ))}
            </div>
        </div>
    );
};

export default RecipesPage;
