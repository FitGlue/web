import React from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Card } from '../components/library/ui';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES } from '../data/recipes';
import './RecipesPage.css';

const RecipesPage: React.FC = () => {
    const { integrations } = useRealtimeIntegrations();

    return (
        <PageLayout title="Recipes">
            <Stack gap="lg" className="recipes-page">
                <div className="fg-band">
                    <span className="fg-band__label">PIPELINE RECIPES</span>
                    <span className="fg-band__right">ONE-CLICK SETUPS</span>
                </div>

                <Card>
                    <Stack gap="md" className="recipes-page__list">
                        {RECIPES.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                integrations={integrations}
                            />
                        ))}
                    </Stack>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default RecipesPage;
