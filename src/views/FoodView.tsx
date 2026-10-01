import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  checkFoodSafety,
  generateMealPlan,
  getPantryRecipes,
  getPickyEaterGuidance,
} from '../services/api';
import {
  FoodCheckResult,
  MealPlanDay,
  PickyEaterResult,
  Recipe,
} from '../types';
import {
  AlertCircle,
  AlertTriangle,
  Apple,
  Calendar,
  ChefHat,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';

type FoodSubTab = 'check' | 'kitchen' | 'planner' | 'picky';

const MEAL_FILTERS = [
  'All',
  'Breakfast',
  'Lunch',
  'Snack',
  'Dinner',
  'Quick Meal',
  'No-Cook',
  'Finger Food',
];

export const FoodView: React.FC = () => {
  const { activeChild, showNotification } = useApp();

  const [activeTab, setActiveTab] = useState<FoodSubTab>('check');

  // Sub-module 1: "What can my child eat?"
  const [foodQuery, setFoodQuery] = useState('');
  const [foodCheckLoading, setFoodCheckLoading] = useState(false);
  const [foodCheckResult, setFoodCheckResult] = useState<FoodCheckResult | null>(null);

  // Sub-module 2: "What's in my kitchen?"
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientsList, setIngredientsList] = useState<string[]>([
    'Banana',
    'Rolled Oats',
    'Plain Curd / Yogurt',
    'Rice',
  ]);
  const [selectedMealFilter, setSelectedMealFilter] = useState('All');
  const [pantryLoading, setPantryLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  // Sub-module 3: Meal Planner
  const [plannerDays, setPlannerDays] = useState<1 | 3 | 7>(3);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<{ days: MealPlanDay[]; groceryTips: string[] } | null>(null);

  // Sub-module 4: Picky Eater Mode
  const [acceptedFoods, setAcceptedFoods] = useState<string[]>(
    activeChild.likes.length > 0 ? activeChild.likes : ['Banana', 'Oatmeal', 'Paneer']
  );
  const [targetCategory, setTargetCategory] = useState('Vegetables');
  const [newAcceptedInput, setNewAcceptedInput] = useState('');
  const [pickyLoading, setPickyLoading] = useState(false);
  const [pickyResult, setPickyResult] = useState<PickyEaterResult | null>(null);

  // 1. Food Check
  const handleFoodCheck = async (query?: string) => {
    const item = query || foodQuery;
    if (!item.trim() || foodCheckLoading) return;
    setFoodCheckLoading(true);
    setFoodCheckResult(null);

    try {
      const res = await checkFoodSafety(item, activeChild);
      setFoodCheckResult(res.data);
    } catch (err) {
      showNotification('Could not verify food item');
    } finally {
      setFoodCheckLoading(false);
    }
  };

  // 2. Kitchen Pantry
  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredientsList.includes(ingredientInput.trim())) {
      setIngredientsList(prev => [...prev, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredientsList(prev => prev.filter(i => i !== ing));
  };

  const handleGeneratePantry = async () => {
    if (ingredientsList.length === 0 || pantryLoading) return;
    setPantryLoading(true);
    setRecipes(null);

    try {
      const res = await getPantryRecipes(ingredientsList, selectedMealFilter, activeChild);
      setRecipes(res.data.recipes);
    } catch (err) {
      showNotification('Failed to generate recipes');
    } finally {
      setPantryLoading(false);
    }
  };

  // 3. Meal Planner
  const handleGenerateMealPlan = async () => {
    if (plannerLoading) return;
    setPlannerLoading(true);
    setMealPlan(null);

    try {
      const res = await generateMealPlan(plannerDays, activeChild);
      setMealPlan(res.data);
    } catch (err) {
      showNotification('Failed to generate meal plan');
    } finally {
      setPlannerLoading(false);
    }
  };

  // 4. Picky Eater
  const addAcceptedFood = () => {
    if (newAcceptedInput.trim() && !acceptedFoods.includes(newAcceptedInput.trim())) {
      setAcceptedFoods(prev => [...prev, newAcceptedInput.trim()]);
      setNewAcceptedInput('');
    }
  };

  const removeAcceptedFood = (food: string) => {
    setAcceptedFoods(prev => prev.filter(f => f !== food));
  };

  const handlePickyEaterGenerate = async () => {
    if (acceptedFoods.length === 0 || pickyLoading) return;
    setPickyLoading(true);
    setPickyResult(null);

    try {
      const res = await getPickyEaterGuidance(acceptedFoods, targetCategory, activeChild);
      setPickyResult(res.data);
    } catch (err) {
      showNotification('Failed to generate picky eating guidance');
    } finally {
      setPickyLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-2 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          Food & Nutrition
        </h1>
        <p className="text-xs text-stone-500">
          Age-appropriate meals, pantry ideas, and low-pressure nutrition for{' '}
          <strong className="text-stone-700 dark:text-stone-300">{activeChild.name}</strong> ({activeChild.ageFormatted})
        </p>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('check')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'check'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Can they eat it?
        </button>

        <button
          onClick={() => setActiveTab('kitchen')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'kitchen'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          What's in my kitchen?
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'planner'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Meal Planner
        </button>

        <button
          onClick={() => setActiveTab('picky')}
          className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'picky'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Picky Eater Mode
        </button>
      </div>

      {/* TAB 1: What can my child eat? */}
      {activeTab === 'check' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              Enter any food, fruit, spice, or ingredient:
            </label>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={foodQuery}
                  onChange={e => setFoodQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFoodCheck()}
                  placeholder="e.g. Can my 2-year-old eat mushrooms? Or honey?"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                onClick={() => handleFoodCheck()}
                disabled={!foodQuery.trim() || foodCheckLoading}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-xs"
              >
                {foodCheckLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check</span>
              </button>
            </div>

            {/* Quick check pill suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Mushrooms', 'Whole Grapes', 'Honey', 'Cow Milk', 'Chia Seeds', 'Shrimp'].map(f => (
                <button
                  key={f}
                  onClick={() => {
                    setFoodQuery(f);
                    handleFoodCheck(f);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-750 hover:bg-amber-50 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {foodCheckLoading && (
            <div className="py-10 text-center space-y-2">
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Checking texture, choking safety, and pediatric guidelines...</p>
            </div>
          )}

          {foodCheckResult && (
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 capitalize">
                      {foodCheckResult.food}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Assessment for {activeChild.name} ({activeChild.ageFormatted})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                      foodCheckResult.chokingHazard === 'High'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    Choking: {foodCheckResult.chokingHazard}
                  </span>
                </div>
              </div>

              {/* Verdict */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                {foodCheckResult.verdictSummary}
              </div>

              {/* Safe Preparation */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  How to Prepare Safely for {activeChild.ageFormatted}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-750 p-3 rounded-2xl border border-stone-100 dark:border-stone-700 leading-relaxed">
                  {foodCheckResult.safePreparation}
                </p>
              </div>

              {/* Choking & Allergy notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
                  <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">Choking Safety</span>
                  <p className="text-stone-500 leading-relaxed">{foodCheckResult.chokingNotes}</p>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
                  <span className="font-bold text-stone-700 dark:text-stone-300 block mb-1">Allergy Considerations</span>
                  <p className="text-stone-500 leading-relaxed">{foodCheckResult.allergyNotes}</p>
                </div>
              </div>

              {/* Serving Idea */}
              {foodCheckResult.servingIdea && (
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                    Toddler Serving Combination
                  </span>
                  <p className="text-stone-700 dark:text-stone-300">{foodCheckResult.servingIdea}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: What's in my kitchen? */}
      {activeTab === 'kitchen' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              Add ingredients currently in your kitchen:
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addIngredient()}
                placeholder="e.g. sweet potato, paneer, peas..."
                className="flex-1 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800"
              >
                + Add
              </button>
            </div>

            {/* Ingredients Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ingredientsList.map(item => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs border border-amber-200 dark:border-amber-800"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeIngredient(item)}
                    className="text-amber-700 hover:text-amber-900 dark:hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Filter by Meal Category */}
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                Meal Type Filter:
              </label>
              <div className="flex flex-wrap gap-1">
                {MEAL_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedMealFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedMealFilter === filter
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGeneratePantry}
              disabled={ingredientsList.length === 0 || pantryLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all shadow-xs"
            >
              {pantryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating recipes for {activeChild.name}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Toddler Meals from Kitchen</span>
                </>
              )}
            </button>
          </div>

          {/* Recipes Output */}
          {recipes && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 px-1 font-display">
                Toddler Recipes with Your Ingredients
              </h3>
              {recipes.map((rec, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        {rec.tag}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {rec.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Prep: {rec.prepTimeMinutes}m · Cook: {rec.cookTimeMinutes}m
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 text-xs text-stone-700 dark:text-stone-300">
                    <strong className="text-amber-900 dark:text-amber-300 block mb-0.5">
                      Age-appropriate Serving & Texture:
                    </strong>
                    {rec.howToServeSafely}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Quick Steps:
                    </div>
                    <ol className="space-y-1 text-xs text-stone-600 dark:text-stone-400 pl-4 list-decimal">
                      {rec.steps.map((st, sidx) => (
                        <li key={sidx} className="leading-relaxed">{st}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ {rec.nutritionHighlight}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Meal Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Plan Duration
                </h3>
                <p className="text-[11px] text-stone-500">
                  Tailored to {activeChild.dietaryPreference}
                  {activeChild.allergies?.length ? ` (Allergies: ${activeChild.allergies.join(', ')})` : ''}
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-750 rounded-xl">
                {([1, 3, 7] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setPlannerDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      plannerDays === d
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    {d} Day{d > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateMealPlan}
              disabled={plannerLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              {plannerLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building {plannerDays}-Day Plan...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Generate {plannerDays}-Day Meal Plan</span>
                </>
              )}
            </button>
          </div>

          {mealPlan && (
            <div className="space-y-4">
              {mealPlan.days.map(day => (
                <div
                  key={day.dayNumber}
                  className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3"
                >
                  <div className="font-bold text-sm text-amber-800 dark:text-amber-400 font-display pb-2 border-b border-stone-100 dark:border-stone-700">
                    {day.dayName}
                  </div>

                  <div className="space-y-2.5">
                    {/* Breakfast */}
                    <div className="text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        Breakfast: {day.meals.breakfast.title}
                      </span>
                      <p className="text-stone-500 text-[11px]">{day.meals.breakfast.description}</p>
                    </div>

                    {/* Morning Snack */}
                    <div className="text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        Morning Snack: {day.meals.morningSnack.title}
                      </span>
                      <p className="text-stone-500 text-[11px]">{day.meals.morningSnack.description}</p>
                    </div>

                    {/* Lunch */}
                    <div className="text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        Lunch: {day.meals.lunch.title}
                      </span>
                      <p className="text-stone-500 text-[11px]">{day.meals.lunch.description}</p>
                    </div>

                    {/* Afternoon Snack */}
                    <div className="text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        Afternoon Snack: {day.meals.afternoonSnack.title}
                      </span>
                      <p className="text-stone-500 text-[11px]">{day.meals.afternoonSnack.description}</p>
                    </div>

                    {/* Dinner */}
                    <div className="text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 block">
                        Dinner: {day.meals.dinner.title}
                      </span>
                      <p className="text-stone-500 text-[11px]">{day.meals.dinner.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {mealPlan.groceryTips?.length > 0 && (
                <div className="p-4 rounded-3xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                    Meal Prep & Grocery Tips
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-stone-700 dark:text-stone-300">
                    {mealPlan.groceryTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Picky Eater Mode */}
      {activeTab === 'picky' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
            <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Low-Pressure Food Chaining
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Based on the Division of Responsibility (no bribing, tricking, or force-feeding). We build gentle bridges from foods {activeChild.name} already accepts.
            </p>

            {/* Currently Accepted Foods */}
            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                Foods {activeChild.name} currently eats without stress:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {acceptedFoods.map(food => (
                  <span
                    key={food}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-750 text-xs font-medium text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
                  >
                    <span>{food}</span>
                    <button onClick={() => removeAcceptedFood(food)} className="text-stone-400 hover:text-stone-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAcceptedInput}
                  onChange={e => setNewAcceptedInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addAcceptedFood()}
                  placeholder="Add accepted food..."
                  className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                />
                <button
                  onClick={addAcceptedFood}
                  className="px-3.5 py-2 bg-stone-200 dark:bg-stone-700 text-xs font-medium rounded-xl text-stone-800 dark:text-white"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Target Category */}
            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                What new food group are you hoping to gently introduce?
              </label>
              <select
                value={targetCategory}
                onChange={e => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              >
                <option value="Vegetables">Green / Root Vegetables</option>
                <option value="Proteins">Proteins (Lentils, Eggs, Tofu, Paneer, Chicken)</option>
                <option value="Fruits">New Fruits & Textures</option>
                <option value="Complex Grains">Whole Grains & Fiber</option>
              </select>
            </div>

            <button
              onClick={handlePickyEaterGenerate}
              disabled={acceptedFoods.length === 0 || pickyLoading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-40"
            >
              {pickyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Designing gentle food bridges...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Gentle Food Bridges</span>
                </>
              )}
            </button>
          </div>

          {pickyResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Stepping stone bridges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 px-1 uppercase tracking-wider">
                  Gentle Food Chain Stepping Stones
                </h4>
                {pickyResult.foodBridges.map((bridge, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold pb-2 border-b border-stone-100 dark:border-stone-700">
                      <span className="text-emerald-700 dark:text-emerald-400">Safe: {bridge.safeBase}</span>
                      <span className="text-stone-400">→</span>
                      <span className="text-amber-700 dark:text-amber-400">Bridge: {bridge.steppingStone}</span>
                      <span className="text-stone-400">→</span>
                      <span className="text-purple-700 dark:text-purple-400">Goal: {bridge.targetNewFood}</span>
                    </div>

                    <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-750 p-3 rounded-2xl border border-stone-100 dark:border-stone-700">
                      <strong className="text-stone-800 dark:text-stone-200 block mb-0.5">
                        Plate Presentation Protocol:
                      </strong>
                      {bridge.howToServe}
                    </div>
                  </div>
                ))}
              </div>

              {/* Low pressure strategies */}
              <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  Calm Low-Pressure Rules for Today
                </div>
                <ul className="space-y-1.5 text-stone-800 dark:text-stone-200">
                  {pickyResult.lowPressureStrategies.map((strat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>{strat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sensory Activity */}
              {pickyResult.funSensoryActivity && (
                <div className="p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sensory Exploration Game (No pressure to eat)
                  </div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">
                    {pickyResult.funSensoryActivity.name}
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                    {pickyResult.funSensoryActivity.instructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
