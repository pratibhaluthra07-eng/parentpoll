import {
  ChildProfile,
  FoodCheckResult,
  MealPlanDay,
  PickyEaterResult,
  Recipe,
  ScreenFreeActivity,
  StructuredAiResponse,
  UrgentTriageResult,
} from '../types';

export interface ChatApiResponse {
  success: boolean;
  isEmergency?: boolean;
  data: StructuredAiResponse;
  fallback?: boolean;
}

/**
 * AI Service Layer - talks to the backend proxy endpoints
 */
export async function sendChatMessage(
  message: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number },
  conversationHistory: { role: string; content: string }[] = []
): Promise<ChatApiResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, childContext, conversationHistory }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Urgent Crisis Triage ("WHAT DO I DO RIGHT NOW?")
 */
export async function getUrgentTriage(
  situation: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; isEmergency?: boolean; data: UrgentTriageResult }> {
  const res = await fetch('/api/urgent/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Food Safety & Preparation Check
 */
export async function checkFoodSafety(
  foodName: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; data: FoodCheckResult }> {
  const res = await fetch('/api/food/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foodName, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Pantry Recipe Ideas ("What's in my kitchen?")
 */
export async function getPantryRecipes(
  ingredients: string[],
  mealType: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; data: { recipes: Recipe[] } }> {
  const res = await fetch('/api/food/pantry-recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, mealType, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Meal Planner (1, 3, or 7 days)
 */
export async function generateMealPlan(
  days: number,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; data: { days: MealPlanDay[]; groceryTips: string[] } }> {
  const res = await fetch('/api/food/meal-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Picky Eater Mode (Food chaining & low-pressure bridges)
 */
export async function getPickyEaterGuidance(
  acceptedFoods: string[],
  targetCategory: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; data: PickyEaterResult }> {
  const res = await fetch('/api/food/picky-eater', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptedFoods, targetCategory, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Screen-Free Activity Generator
 */
export async function generateActivity(
  category: string,
  duration: string,
  location: string,
  childContext: ChildProfile & { ageFormatted: string; ageMonths: number }
): Promise<{ success: boolean; data: ScreenFreeActivity }> {
  const res = await fetch('/api/activities/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, duration, location, childContext }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}

/**
 * Development Milestones (AAP/CDC aligned)
 */
export async function getDevelopmentMilestones(ageGroup: string): Promise<any> {
  const res = await fetch('/api/development/milestones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ageGroup }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return res.json();
}
