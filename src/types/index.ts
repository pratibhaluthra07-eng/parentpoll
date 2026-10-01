export type DietaryPreference = 'Vegetarian' | 'Non-vegetarian' | 'Eggitarian' | 'Vegan' | 'Other';

export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender?: 'girl' | 'boy' | 'neutral' | 'prefer-not-to-say';
  dietaryPreference: DietaryPreference;
  allergies: string[];
  likes: string[];
  dislikes: string[];
  sleepSchedule: {
    wakeTime: string; // "07:00"
    napTime: string;  // "13:00 - 14:30"
    bedtime: string;  // "20:00"
    nightWakings?: string; // "0-1 times"
  };
  daycareOrHome: 'Home' | 'Daycare' | 'Both';
  developmentNotes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  location?: string;
  parentingGoals: string[];
}

export interface StructuredAiResponse {
  whatYouCanDoNow: string[];
  whyThisIsHappening: string;
  tryThis: string[];
  watchFor: string[];
  whenToSeekHelp?: string;
  quickScript?: string;
  oneFollowUpQuestion?: string;
  detectedProfileUpdate?: {
    type: 'none' | 'like' | 'dislike' | 'allergy' | 'milestone';
    item: string | null;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  structuredData?: StructuredAiResponse;
  timestamp: number;
  isEmergency?: boolean;
}

export interface Conversation {
  id: string;
  childId: string;
  title: string;
  category: 'Food' | 'Sleep' | 'Behavior' | 'Activity' | 'Development' | 'General';
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface UrgentTriageResult {
  rightNow: string[];
  whatToSay: string;
  whatNotToDo: string[];
  calmReminder: string;
}

export interface FoodCheckResult {
  food: string;
  isAgeAppropriate: boolean;
  verdictSummary: string;
  safePreparation: string;
  chokingHazard: 'Low' | 'Medium' | 'High';
  chokingNotes: string;
  allergyNotes: string;
  nutritionalBenefits: string[];
  servingIdea: string;
}

export interface Recipe {
  name: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  tag: string;
  keyIngredientsUsed: string[];
  howToServeSafely: string;
  steps: string[];
  nutritionHighlight: string;
}

export interface MealPlanDay {
  dayNumber: number;
  dayName: string;
  meals: {
    breakfast: { title: string; description: string; quickTip: string };
    morningSnack: { title: string; description: string; quickTip: string };
    lunch: { title: string; description: string; quickTip: string };
    afternoonSnack: { title: string; description: string; quickTip: string };
    dinner: { title: string; description: string; quickTip: string };
  };
}

export interface PickyEaterBridge {
  safeBase: string;
  steppingStone: string;
  targetNewFood: string;
  howToServe: string;
}

export interface PickyEaterResult {
  foodBridges: PickyEaterBridge[];
  lowPressureStrategies: string[];
  funSensoryActivity: {
    name: string;
    instructions: string;
  };
}

export interface ScreenFreeActivity {
  id: string;
  title: string;
  ageRange: string;
  duration: string;
  location: 'Indoor' | 'Outdoor' | 'Either';
  category: 'Sensory' | 'Creative' | 'Motor' | 'Cognitive' | 'Independent Play' | 'Parent-Child';
  materialsNeeded: string[];
  steps: string[];
  skillsDeveloped: string[];
  proTip?: string;
  isFavorite?: boolean;
}
