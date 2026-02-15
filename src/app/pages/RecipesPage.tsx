import React from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Heading, Paragraph, Card, CardHeader } from '../components/library/ui';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES } from '../data/recipes';
import './RecipesPage.css';

const RecipesPage: React.FC = () => {
    const { integrations } = useRealtimeIntegrations();

    return (
        <PageLayout title="Recipes">
            <Stack gap="lg" className="recipes-page">
                <Stack gap="xs" align="center" className="recipes-page__intro">
                    <Heading level={2} className="recipes-page__subtitle">
                        One-click pipeline setups for common goals
                    </Heading>
                    <Paragraph className="recipes-page__description">
                        Pick an outcome. Import the pipeline. Customise it later if you want.
                    </Paragraph>
                </Stack>

                <Card>
                    <CardHeader icon="📋" title="Recipes" showLink={false} />
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
