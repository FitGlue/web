import React, { useState } from 'react';
import { PageLayout, Stack } from '../components/library/layout';
import { Heading, Paragraph, TabbedCard, EmptyState } from '../components/library/ui';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES, RECIPE_CATEGORIES, type RecipeCategory } from '../data/recipes';
import './RecipesPage.css';

const ALL_TAB = { id: 'all', icon: '📋', label: 'All' };

const TABS = [
    ALL_TAB,
    ...RECIPE_CATEGORIES.map(cat => ({
        id: cat.id,
        icon: cat.icon,
        label: cat.label,
        count: RECIPES.filter(r => r.category === cat.id).length,
    })),
];

const RecipesPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<RecipeCategory | 'all'>('all');
    const { integrations } = useRealtimeIntegrations();

    const filteredRecipes = activeCategory === 'all'
        ? RECIPES
        : RECIPES.filter(r => r.category === activeCategory);

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

                <TabbedCard
                    tabs={TABS}
                    activeTab={activeCategory}
                    onTabChange={(id) => setActiveCategory(id as RecipeCategory | 'all')}
                    footerText={<>{filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}</>}
                >
                    <Stack gap="md" className="recipes-page__list">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.id}
                                recipe={recipe}
                                integrations={integrations}
                            />
                        ))}

                        {filteredRecipes.length === 0 && (
                            <EmptyState
                                icon="🧪"
                                title="No recipes yet"
                                description="More recipes in this category coming soon!"
                            />
                        )}
                    </Stack>
                </TabbedCard>
            </Stack>
        </PageLayout>
    );
};

export default RecipesPage;
