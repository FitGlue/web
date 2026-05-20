import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRealtimeIntegrations } from '../hooks/useRealtimeIntegrations';
import { PageLayout } from '../components/library/layout';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RECIPES, RECIPE_CATEGORIES, RecipeCategory } from '../data/recipes';
import './RecipesPage.css';

const FILTER_ALL = 'all';

const RecipesPage: React.FC = () => {
    const { integrations } = useRealtimeIntegrations();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeFilter = (searchParams.get('category') || FILTER_ALL) as RecipeCategory | 'all';

    const setFilter = (category: RecipeCategory | 'all') => {
        if (category === FILTER_ALL) {
            searchParams.delete('category');
        } else {
            searchParams.set('category', category);
        }
        setSearchParams(searchParams, { replace: true });
    };

    const filteredRecipes = activeFilter === FILTER_ALL
        ? RECIPES
        : RECIPES.filter(r => r.category === activeFilter);

    // Count per category
    const counts: Record<string, number> = { all: RECIPES.length };
    for (const cat of RECIPE_CATEGORIES) {
        counts[cat.id] = RECIPES.filter(r => r.category === cat.id).length;
    }

    return (
        <PageLayout
            title="Recipes"
            backTo="/"
            backLabel="Dashboard"
            headerSubtitle="Pick a recipe; we'll spin up the pipeline pre-configured. Edit the result as much as you want."
        >
            <div className="fg-band">
                <span className="fg-band__label">PIPELINE RECIPES</span>
                <span className="fg-band__right">{RECIPES.length} AVAILABLE</span>
            </div>

            {/* Filter chips */}
            <div className="recipes-filter">
                <button
                    className={`recipes-filter__chip${activeFilter === FILTER_ALL ? ' recipes-filter__chip--active' : ''}`}
                    onClick={() => setFilter(FILTER_ALL)}
                >
                    ALL
                    <span className="recipes-filter__chip-count">{counts.all}</span>
                </button>
                {RECIPE_CATEGORIES.filter(cat => counts[cat.id] > 0).map(cat => (
                    <button
                        key={cat.id}
                        className={`recipes-filter__chip${activeFilter === cat.id ? ' recipes-filter__chip--active' : ''}`}
                        onClick={() => setFilter(cat.id)}
                    >
                        {cat.icon} {cat.label.toUpperCase()}
                        <span className="recipes-filter__chip-count">{counts[cat.id]}</span>
                    </button>
                ))}
            </div>

            {/* 3-column grid */}
            <div className="recipes-grid">
                {filteredRecipes.map(recipe => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        integrations={integrations}
                    />
                ))}
            </div>

            {filteredRecipes.length === 0 && (
                <div className="recipes-empty">
                    <div className="recipes-empty__title">NO RECIPES</div>
                    <p className="recipes-empty__sub">No recipes match this filter.</p>
                </div>
            )}
        </PageLayout>
    );
};

export default RecipesPage;
