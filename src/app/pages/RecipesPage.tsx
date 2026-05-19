import React from 'react';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { PageLayout } from '../components/library/layout';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES } from '../data/recipes';
import './RecipesPage.css';

const RecipesPage: React.FC = () => {
    const { integrations } = useRealtimeIntegrations();

    return (
        <PageLayout title="Recipes" backTo="/" backLabel="Dashboard">
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
        </PageLayout>
    );
};

export default RecipesPage;
