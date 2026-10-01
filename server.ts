import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize Gemini SDK with User-Agent as required by skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for calling Gemini 3.8 Flash
async function callGemini(systemInstruction: string, prompt: string, responseJson = false): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('NO_API_KEY');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
      ...(responseJson ? { responseMimeType: 'application/json' } : {}),
    },
  });

  return response.text || '';
}

// Medical emergency detection helper
function detectMedicalEmergency(text: string): boolean {
  const redFlags = [
    'trouble breathing',
    'difficulty breathing',
    'choking right now',
    'blue lips',
    'unconscious',
    'passed out',
    'seizure',
    'swallowed battery',
    'swallowed poison',
    'drank bleach',
    'severe allergic reaction',
    'anaphylaxis',
    'unresponsive',
    'head injury vomiting',
    'lethargic not waking up',
  ];
  const lower = text.toLowerCase();
  return redFlags.some(flag => lower.includes(flag));
}

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, childContext, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isEmergency = detectMedicalEmergency(message);

    const childAgeDesc = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;
    const childName = childContext?.name || 'your child';
    const diet = childContext?.dietaryPreference || 'Any';
    const allergies = childContext?.allergies?.length ? childContext.allergies.join(', ') : 'None reported';
    const likes = childContext?.likes?.length ? childContext.likes.join(', ') : 'Not specified';
    const dislikes = childContext?.dislikes?.length ? childContext.dislikes.join(', ') : 'Not specified';
    const sleep = childContext?.sleepSchedule || 'Standard routine';

    const systemPrompt = `You are ParentPal AI, an expert, calm, warm, and highly practical AI parenting companion.
The child you are helping with is:
- Name: ${childName}
- Age: ${childAgeDesc}
- Dietary Preference: ${diet}
- Allergies: ${allergies}
- Liked Foods/Activities: ${likes}
- Disliked Foods/Activities: ${dislikes}
- Sleep Schedule/Routine: ${JSON.stringify(sleep)}

Tone & Rules:
1. Warm, calm, non-judgmental, practical, reassuring, and parent-friendly. NEVER shame the parent.
2. The core promise is: "Ask what's happening. Know what to do next." Prioritize clear next steps.
3. Automatically adapt advice strictly to the child's exact age (${childAgeDesc}). Never give baby advice to a 4-year-old or school advice to a 14-month-old.
4. Honor allergies (${allergies}) and dislikes (${dislikes}). Never suggest allergenic foods.
5. If medical red flags are present, give immediate calming emergency instructions to contact healthcare/emergency, but never pretend to be a doctor.
6. Do NOT write unnecessary long essays. Keep each section punchy and readable with bullet points.

Format your response as a valid JSON object with the following keys:
{
  "whatYouCanDoNow": ["Step 1", "Step 2", "Step 3"],
  "whyThisIsHappening": "Short, reassuring 1-2 sentence explanation of typical child development or physical reason.",
  "tryThis": ["Practical alternative idea 1", "Practical alternative idea 2"],
  "watchFor": ["Warning sign or thing to observe"],
  "whenToSeekHelp": "Guidance on when to consult pediatrician, or empty string if not applicable.",
  "quickScript": "A gentle sentence the parent can actually say right now (if applicable, else empty)",
  "oneFollowUpQuestion": "One gentle, thoughtful follow-up question to help the parent next.",
  "detectedProfileUpdate": {
    "type": "none" | "like" | "dislike" | "allergy" | "milestone",
    "item": "string description if parent mentioned a new food like/dislike/habit, else null"
  }
}`;

    const prompt = `Conversation history:
${conversationHistory.slice(-4).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Parent's current question/situation: "${message}"`;

    try {
      const aiResponse = await callGemini(systemPrompt, prompt, true);
      const parsed = JSON.parse(aiResponse);
      return res.json({ success: true, isEmergency, data: parsed });
    } catch (genErr) {
      // Fallback response generator if API key is missing or quota exceeded
      const fallbackData = generateChatFallback(message, childContext, isEmergency);
      return res.json({ success: true, isEmergency, data: fallbackData, fallback: true });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process chat' });
  }
});

// 2. "WHAT DO I DO RIGHT NOW?" Emergency triage endpoint
app.post('/api/urgent/triage', async (req, res) => {
  try {
    const { situation, childContext } = req.body;
    const childName = childContext?.name || 'Your child';
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;

    const isEmergency = detectMedicalEmergency(situation);

    const systemPrompt = `You are ParentPal AI's Instant Crisis Triage assistant. A parent is facing a stressful parenting situation right now with their child (${childName}, age: ${age}).
Give immediate, calm, practical steps they can take in the next 60 seconds.
Do not overwhelm them.

Respond in JSON with:
{
  "rightNow": ["Immediate action 1", "Immediate action 2", "Immediate action 3"],
  "whatToSay": "Exact soothing, clear words to say to the child right now",
  "whatNotToDo": ["Thing to avoid 1", "Thing to avoid 2"],
  "calmReminder": "A 1-sentence grounding reminder for the parent to take a deep breath."
}`;

    const prompt = `Current crisis situation: "${situation}"`;

    try {
      const response = await callGemini(systemPrompt, prompt, true);
      return res.json({ success: true, isEmergency, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        isEmergency,
        data: generateUrgentFallback(situation, childName, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Food safety & preparation check
app.post('/api/food/check', async (req, res) => {
  try {
    const { foodName, childContext } = req.body;
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;
    const allergies = childContext?.allergies || [];

    const systemPrompt = `You are ParentPal AI Pediatric Nutrition Advisor.
Evaluate the food "${foodName}" for a child aged ${age}. Known allergies: ${allergies.join(', ') || 'None'}.
Return a JSON object:
{
  "food": "${foodName}",
  "isAgeAppropriate": true,
  "verdictSummary": "Short 1-sentence bottom line verdict",
  "safePreparation": "Detailed, specific texture/cutting instructions for this exact age (e.g. quartering grapes, steaming hard vegetables)",
  "chokingHazard": "Low" | "Medium" | "High",
  "chokingNotes": "Specific choking warning or prevention instructions",
  "allergyNotes": "Allergenic potential and introduction protocol",
  "nutritionalBenefits": ["Benefit 1", "Benefit 2"],
  "servingIdea": "A simple, child-friendly serving combination"
}`;

    try {
      const response = await callGemini(systemPrompt, `Check food: ${foodName}`, true);
      return res.json({ success: true, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        data: generateFoodCheckFallback(foodName, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Pantry Recipe Generator ("What's in my kitchen?")
app.post('/api/food/pantry-recipes', async (req, res) => {
  try {
    const { ingredients, mealType, childContext } = req.body;
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;
    const diet = childContext?.dietaryPreference || 'Any';
    const allergies = childContext?.allergies || [];
    const dislikes = childContext?.dislikes || [];

    const systemPrompt = `You are a creative child-nutrition chef.
Create 3 easy, healthy, age-appropriate toddler recipes using these available ingredients: "${ingredients.join(', ')}".
Meal filter: "${mealType || 'Any'}".
Child age: ${age}.
Dietary preference: ${diet}.
Strictly avoid: ${[...allergies, ...dislikes].join(', ') || 'None'}.

Return JSON:
{
  "recipes": [
    {
      "name": "Recipe Title",
      "prepTimeMinutes": 10,
      "cookTimeMinutes": 15,
      "tag": "Quick / No-Cook / Finger Food",
      "keyIngredientsUsed": ["ingredient 1", "ingredient 2"],
      "howToServeSafely": "Age-appropriate texture tip",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "nutritionHighlight": "High in iron / soft fiber"
    }
  ]
}`;

    try {
      const response = await callGemini(systemPrompt, `Ingredients: ${ingredients.join(', ')}`, true);
      return res.json({ success: true, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        data: generatePantryFallback(ingredients, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Meal Planner (1, 3, 7 days)
app.post('/api/food/meal-plan', async (req, res) => {
  try {
    const { days = 3, childContext } = req.body;
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;
    const diet = childContext?.dietaryPreference || 'Vegetarian';
    const allergies = childContext?.allergies || [];
    const likes = childContext?.likes || [];
    const dislikes = childContext?.dislikes || [];

    const systemPrompt = `Create a realistic ${days}-day toddler meal plan for a child aged ${age}.
Dietary preference: ${diet}.
Likes: ${likes.join(', ') || 'Standard toddler foods'}.
Never include allergies/dislikes: ${[...allergies, ...dislikes].join(', ') || 'None'}.
Keep portions realistic, low-prep, and finger-food friendly.

Return JSON:
{
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Day 1",
      "meals": {
        "breakfast": { "title": "...", "description": "...", "quickTip": "..." },
        "morningSnack": { "title": "...", "description": "...", "quickTip": "..." },
        "lunch": { "title": "...", "description": "...", "quickTip": "..." },
        "afternoonSnack": { "title": "...", "description": "...", "quickTip": "..." },
        "dinner": { "title": "...", "description": "...", "quickTip": "..." }
      }
    }
  ],
  "groceryTips": ["Tip 1", "Tip 2"]
}`;

    try {
      const response = await callGemini(systemPrompt, `Generate ${days} day plan`, true);
      return res.json({ success: true, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        data: generateMealPlanFallback(days, diet, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Picky Eater Mode (Food chaining & low-pressure bridges)
app.post('/api/food/picky-eater', async (req, res) => {
  try {
    const { acceptedFoods, targetCategory, childContext } = req.body;
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;

    const systemPrompt = `You are a pediatric feeding therapist and low-pressure nutrition guide.
The child (${age}) happily eats: "${acceptedFoods.join(', ')}".
The parent wants to gently introduce: "${targetCategory || 'Vegetables'}".
NEVER advise force feeding, bribing, or tricking. Focus on Division of Responsibility (Ellyn Satter method), food chaining, sensory exploration, and tiny pressure-free steps.

Return JSON:
{
  "foodBridges": [
    {
      "safeBase": "A food they already like",
      "steppingStone": "A bridge food with similar color/texture",
      "targetNewFood": "The goal food",
      "howToServe": "Step-by-step low pressure plate setup"
    }
  ],
  "lowPressureStrategies": [
    "Practical phrase or strategy 1",
    "Practical phrase or strategy 2",
    "Practical phrase or strategy 3"
  ],
  "funSensoryActivity": {
    "name": "Food exploration activity without pressure to eat",
    "instructions": "Simple 2-step setup"
  }
}`;

    try {
      const response = await callGemini(systemPrompt, `Safe foods: ${acceptedFoods.join(', ')}`, true);
      return res.json({ success: true, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        data: generatePickyEaterFallback(acceptedFoods, targetCategory, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Screen-free Activity Generator
app.post('/api/activities/generate', async (req, res) => {
  try {
    const { category, duration, location, childContext } = req.body;
    const age = childContext?.ageFormatted || `${childContext?.ageMonths || 24} months`;
    const childName = childContext?.name || 'child';

    const systemPrompt = `You are an early childhood educator and play specialist.
Generate a delightful, engaging screen-free activity for ${childName} (age: ${age}).
Criteria:
- Category: ${category || 'Sensory / Motor'}
- Duration: ${duration || '15 minutes'}
- Location: ${location || 'Indoor'}

Format as JSON:
{
  "title": "Creative Activity Name",
  "ageRange": "${age}",
  "duration": "${duration || '15 min'}",
  "location": "${location || 'Indoor'}",
  "materialsNeeded": ["Household item 1", "Household item 2"],
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "skillsDeveloped": ["Fine motor skills", "Patience", "Hand-eye coordination"],
  "proTip": "How to make clean-up easy or adapt if frustrated"
}`;

    try {
      const response = await callGemini(systemPrompt, `Generate activity for ${age}`, true);
      return res.json({ success: true, data: JSON.parse(response) });
    } catch (err) {
      return res.json({
        success: true,
        data: generateActivityFallback(category, duration, age),
        fallback: true,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback Generators (ensures zero broken experiences)
function generateChatFallback(message: string, childContext: any, isEmergency: boolean) {
  const childName = childContext?.name || 'your child';
  const age = childContext?.ageFormatted || '2 years old';

  if (isEmergency) {
    return {
      whatYouCanDoNow: [
        'Stay calm and evaluate your child right now.',
        'If experiencing breathing distress, anaphylaxis, seizure, or poisoning, call local emergency services immediately (911 / 112).',
        'Keep the airway clear and do not administer random medications or induce vomiting unless instructed by poison control.',
      ],
      whyThisIsHappening: 'These signs indicate a critical medical situation requiring immediate professional assessment.',
      tryThis: ['Keep the child upright if conscious, stay by their side, and contact emergency medical professionals.'],
      watchFor: ['Difficulty breathing', 'Lethargy or loss of consciousness', 'Swelling of mouth/tongue'],
      whenToSeekHelp: 'Seek immediate emergency medical care now.',
      quickScript: 'I am right here with you. Mommy/Daddy has you safe.',
      oneFollowUpQuestion: 'Are you in a safe position to reach medical assistance right now?',
      detectedProfileUpdate: { type: 'none', item: null },
    };
  }

  // Smart heuristic based on keywords
  const lower = message.toLowerCase();
  if (lower.includes('eat') || lower.includes('food') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('vegetable')) {
    return {
      whatYouCanDoNow: [
        `Serve one familiar "safe food" on ${childName}'s plate alongside a tiny portion of the new food.`,
        'End the meal calmly after 20 minutes without scolding or bargaining.',
        'Offer a healthy scheduled snack later (e.g. banana with nut butter or curd) rather than instant dessert.',
      ],
      whyThisIsHappening: `At ${age}, toddlers undergo natural "neophobia" (fear of new foods) and appetite shifts as growth rates naturally slow compared to infancy.`,
      tryThis: [
        'Let them explore food with their hands or a dip (curd/hummus).',
        'Model eating it yourself with enjoyment without saying "Look how good this is!".',
      ],
      watchFor: ['Consistent energy and proper hydration through wet diapers or regular bathroom visits.'],
      whenToSeekHelp: 'Consult your pediatrician if your child drops below 5-10 accepted foods or loses weight.',
      quickScript: 'You don\'t have to eat it. It can just sit on your plate to say hello.',
      oneFollowUpQuestion: 'What is one food that they consistently enjoy eating right now?',
      detectedProfileUpdate: { type: 'none', item: null },
    };
  }

  if (lower.includes('sleep') || lower.includes('wake') || lower.includes('bedtime') || lower.includes('nap')) {
    return {
      whatYouCanDoNow: [
        'Keep nighttime interactions very quiet, dark, and boring (dim red/warm light, minimal talking).',
        'Verify daytime wake windows: ensure at least 4.5 to 5.5 hours between the end of nap and bedtime.',
        'Use a predictable 3-step bedtime routine: bath/wash, 2 short books, lights out with white noise.',
      ],
      whyThisIsHappening: `Around ${age}, toddlers experience cognitive leaps, developmental separation anxiety, and testing boundaries around bedtime independence.`,
      tryThis: [
        'Offer two simple choices: "Do you want the blue pajamas or the yellow ones?"',
        'Use a visual toddler wake clock or consistent bedtime phrase.',
      ],
      watchFor: ['Overtiredness signs like frantic hyper energy before bed or rub eyes.'],
      whenToSeekHelp: 'If night waking is accompanied by snoring, mouth breathing, or daytime lethargy.',
      quickScript: 'It is sleep time now. Your body is resting, and I will see you in the morning when the sun wakes up.',
      oneFollowUpQuestion: 'What time did their last daytime nap finish today?',
      detectedProfileUpdate: { type: 'none', item: null },
    };
  }

  // Default general parenting advice
  return {
    whatYouCanDoNow: [
      `Acknowledge ${childName}'s feelings first with calm eye contact and a gentle voice.`,
      'State what they CAN do rather than what they cannot (e.g., "Feet stay on the floor" instead of "Stop jumping!").',
      'Provide a simple, structured choice between two acceptable options.',
    ],
    whyThisIsHappening: `Toddlers around ${age} have huge emotional drives but still developing prefrontal cortexes; their impulse control is just beginning to form.`,
    tryThis: [
      'Take 3 slow deep breaths yourself before responding.',
      'Use gentle physical redirection rather than repeated verbal warnings.',
    ],
    watchFor: ['Physical exhaustion, hunger, or sensory overload as common root triggers.'],
    whenToSeekHelp: '',
    quickScript: `I see you are having big feelings. I am right here with you, and it is safe.`,
    oneFollowUpQuestion: `Would you like a quick 5-minute activity or a calming reset for ${childName} right now?`,
    detectedProfileUpdate: { type: 'none', item: null },
  };
}

function generateUrgentFallback(situation: string, childName: string, age: string) {
  return {
    rightNow: [
      'Stop talking and lower your voice to a quiet whisper. Your nervous system co-regulates theirs.',
      `Move close, get down to ${childName}'s eye level, and ensure physical safety without grabbing tightly.`,
      'Wait 30 seconds of quiet presence before trying to reason or give instructions.',
    ],
    whatToSay: `I'm right here with you. You are safe. We will figure this out together.`,
    whatNotToDo: [
      'Do not yell, negotiate, or ask "Why did you do that?".',
      'Do not give in to a safety boundary just to stop the crying.',
      'Do not isolate them as punishment while their emotions are overflowing.',
    ],
    calmReminder: 'Drop your shoulders, unclamp your jaw, and take one deep slow breath. You are doing great.',
  };
}

function generateFoodCheckFallback(food: string, age: string) {
  const isChokingHigh = ['grape', 'hot dog', 'nut', 'popcorn', 'hard candy', 'marshmallow'].some(c => food.toLowerCase().includes(c));
  return {
    food,
    isAgeAppropriate: true,
    verdictSummary: `Generally safe and nutritious for a toddler (${age}) when prepared with proper age-appropriate texture.`,
    safePreparation: isChokingHigh
      ? 'High choking hazard in raw/whole form! Always cut lengthwise into quarters or steam until easily squishable between fingers.'
      : 'Serve cooked until tender, cut into bite-sized finger pieces or soft thin strips.',
    chokingHazard: isChokingHigh ? 'High' : 'Low',
    chokingNotes: isChokingHigh
      ? 'Never serve whole round pieces to toddlers under 4. Quarter lengthwise.'
      : 'Ensure food is soft enough to yield under gentle finger pressure.',
    allergyNotes: 'Introduce one single ingredient in small amount during daytime so you can observe any reaction.',
    nutritionalBenefits: ['Provides essential micronutrients', 'Helps develop oral chewing mechanics'],
    servingIdea: `Serve paired with a familiar dip or alongside a favorite fruit.`,
  };
}

function generatePantryFallback(ingredients: string[], age: string) {
  return {
    recipes: [
      {
        name: 'Quick Toddler Warm Bowl',
        prepTimeMinutes: 5,
        cookTimeMinutes: 10,
        tag: 'Quick Meal',
        keyIngredientsUsed: ingredients.slice(0, 3),
        howToServeSafely: 'Ensure temperature is lukewarm and consistency is soft and easy to scoop.',
        steps: [
          `Combine ${ingredients[0] || 'base'} with warm broth, water, or milk.`,
          `Gently fold in ${ingredients[1] || 'vegetable/fruit'} until soft and blended.`,
          'Let cool slightly and serve in a shallow suction bowl.',
        ],
        nutritionHighlight: 'Wholesome balanced fiber and gentle energy for active toddlers.',
      },
      {
        name: 'Soft Finger Food Bites',
        prepTimeMinutes: 8,
        cookTimeMinutes: 12,
        tag: 'Finger Food',
        keyIngredientsUsed: ingredients.slice(0, 2),
        howToServeSafely: 'Cut into bite-sized rounds or strips easy for toddler grasp.',
        steps: [
          `Mash ingredients together into small soft patties.`,
          'Lightly pan cook with a drop of ghee or olive oil until soft and warm.',
          'Cool and serve as self-feeding finger food.',
        ],
        nutritionHighlight: 'Encourages pincer grasp and independent toddler feeding.',
      },
    ],
  };
}

function generateMealPlanFallback(days: number, diet: string, age: string) {
  const planDays = [];
  for (let i = 1; i <= Math.min(days, 7); i++) {
    planDays.push({
      dayNumber: i,
      dayName: `Day ${i}`,
      meals: {
        breakfast: {
          title: 'Rolled Oats with Banana & Chia',
          description: 'Creamy warm oats cooked with milk or water, topped with mashed ripe banana.',
          quickTip: 'Mash banana directly into hot oats to naturally sweeten.',
        },
        morningSnack: {
          title: 'Steamed Apple Slices & Cheese Cube',
          description: 'Thinly sliced steamed apple paired with mild cheddar or paneer cube.',
          quickTip: 'Soft enough to mash with gums.',
        },
        lunch: {
          title: 'Soft Rice with Yellow Lentil (Moong Dal)',
          description: 'Soft well-cooked rice mixed with mild yellow dal and a tiny spoon of ghee.',
          quickTip: 'Gentle on digestion and rich in plant protein.',
        },
        afternoonSnack: {
          title: 'Curd / Yogurt with Berry Swirl',
          description: 'Full-fat plain Greek yogurt with mashed blueberries or strawberries.',
          quickTip: 'Great natural source of calcium and probiotics.',
        },
        dinner: {
          title: 'Soft Veggie Khichdi or Sweet Potato Mash',
          description: 'Mashed sweet potato and peas served with soft mini flatbread or rice.',
          quickTip: 'Warm and comforting for easier bedtime wind-down.',
        },
      },
    });
  }
  return {
    days: planDays,
    groceryTips: [
      'Batch-cook soft lentils or grains to store in fridge for 2-3 days.',
      'Always have ripe bananas, yogurt, and sweet potatoes on hand for quick saves.',
    ],
  };
}

function generatePickyEaterFallback(acceptedFoods: string[], targetCategory: string, age: string) {
  const safe = acceptedFoods[0] || 'banana';
  return {
    foodBridges: [
      {
        safeBase: safe,
        steppingStone: `Baked sweet potato or carrot chips with similar golden color and slight sweetness to ${safe}`,
        targetNewFood: `Steamed tender ${targetCategory.toLowerCase()}`,
        howToServe: `Place a tiny pea-sized piece of the new food on the corner of the plate. Tell them: "You can just look at it or smell it; you don't have to eat it."`,
      },
    ],
    lowPressureStrategies: [
      'Division of Responsibility: You decide what, when, and where. Your child decides if and how much.',
      'Serve "micro-portions" of new food (literally the size of a pumpkin seed) so it is not visually overwhelming.',
      'Use playful sensory words ("Does it crunch or squish?") rather than asking "Do you like it?".',
    ],
    funSensoryActivity: {
      name: 'The Food Explorer Game',
      instructions: 'Give the child a toy magnifying glass or small fork. Ask them to investigate what color it is inside without any requirement to put it in their mouth.',
    },
  };
}

function generateActivityFallback(category: string, duration: string, age: string) {
  return {
    title: 'Kitchen Sensory Water Pouring Station',
    ageRange: age,
    duration: duration || '15 min',
    location: 'Indoor',
    materialsNeeded: ['Baking tray or large towel', '2 plastic cups or measuring cups', 'Water', 'A few plastic spoons or toys'],
    steps: [
      'Spread a dry bath towel or large shallow tray on the floor.',
      'Fill one cup halfway with lukewarm water.',
      'Demonstrate gently pouring water from one cup to another.',
      'Let your child practice pouring, splashing, and scooping independently.',
    ],
    skillsDeveloped: ['Bilateral hand coordination', 'Patience & concentration', 'Fine motor grasp control'],
    proTip: 'Add 2 drops of food coloring or a few ice cubes for extra visual and tactile excitement!',
  };
}

// Development endpoint
app.post('/api/development/milestones', async (req, res) => {
  try {
    const { ageGroup } = req.body;
    // Standard AAP/CDC non-pass/fail observations
    const milestonesData = getDevelopmentData(ageGroup || '1-2y');
    res.json({ success: true, data: milestonesData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function getDevelopmentData(ageGroup: string) {
  const catalog: Record<string, any> = {
    '1-2y': {
      ageTitle: '12 to 24 Months (Early Toddler)',
      overview: 'A wonderful period of rapidly blooming mobility, discovery, and first words.',
      categories: [
        {
          name: 'Communication',
          skillsToEncourage: ['Uses simple gestures like waving bye-bye', 'Points to things they want', 'Says 2 to 10 single words'],
          simpleActivity: 'Narrate what you are doing together: "Now we wash the blue cup, scrub scrub scrub!"',
          thingsToObserve: 'Does your child turn when their name is called and use sounds to get your attention?',
        },
        {
          name: 'Motor Skills',
          skillsToEncourage: ['Walking independently', 'Bending down to pick up a toy without falling', 'Stacking 2-3 blocks'],
          simpleActivity: 'Create a cushion obstacle course in the living room for safe stepping and climbing.',
          thingsToObserve: 'Steady balance progression and beginning to run with joy.',
        },
        {
          name: 'Social & Emotional',
          skillsToEncourage: ['Imitates everyday actions (brushing doll\'s hair, feeding teddy)', 'Shows affection with hugs', 'Notices other children'],
          simpleActivity: 'Play peek-a-boo behind a cloth or pretend to feed a soft toy.',
          thingsToObserve: 'Looking back at you for reassurance when trying something new.',
        },
        {
          name: 'Cognitive',
          skillsToEncourage: ['Finds hidden objects easily', 'Explores objects by banging, shaking, and dropping', 'Points to body parts'],
          simpleActivity: 'Hide a wooden block under a cup and ask "Where did it go?".',
          thingsToObserve: 'Understanding simple 1-step requests like "Bring me the ball".',
        },
      ],
      medicalNote: 'Milestones are approximate ranges, not strict tests. If you ever have questions about hearing, speech, or vision, discuss with your pediatrician.',
    },
    '2-3y': {
      ageTitle: '2 to 3 Years (Curious Explorer)',
      overview: 'Imagination takes flight, language explodes, and big feelings meet new independence.',
      categories: [
        {
          name: 'Communication',
          skillsToEncourage: ['Strings 2-4 words together ("More milk please", "Daddy go car")', 'Follows 2-step instructions', 'Understands most of what family says'],
          simpleActivity: 'Sing songs with hand motions like "Wheels on the Bus" or "Itsy Bitsy Spider".',
          thingsToObserve: 'Using language to express desires and naming familiar household items.',
        },
        {
          name: 'Motor Skills',
          skillsToEncourage: ['Kicks a ball forward', 'Jumps with both feet', 'Draws simple lines or circles with thick crayons'],
          simpleActivity: 'Drawing with washable chunky crayons on large cardboard boxes.',
          thingsToObserve: 'Growing finger dexterity and walking up stairs one step at a time.',
        },
        {
          name: 'Social & Emotional',
          skillsToEncourage: ['Shows wide range of emotions', 'Plays alongside peers (parallel play)', 'Defends possessions ("Mine!")'],
          simpleActivity: 'Label emotions in storybook pictures: "Look, the bear is happy because he found honey!".',
          thingsToObserve: 'Calming down with gentle comfort after a big emotional outburst.',
        },
        {
          name: 'Cognitive & Self-Help',
          skillsToEncourage: ['Can match 2-3 basic colors or shapes', 'Takes off loose shoes/socks', 'Beginning interest in potty training'],
          simpleActivity: 'Sort socks by color or match container lids.',
          thingsToObserve: 'Solving simple 3-piece wooden inset puzzles.',
        },
      ],
      medicalNote: 'Every child develops on their own unique curve. Bring any developmental questions to your routine well-child checkup.',
    },
    '3-4y': {
      ageTitle: '3 to 4 Years (Imaginative Storyteller)',
      overview: 'Questions ("Why?"), complex pretend play, and growing social play with friends.',
      categories: [
        {
          name: 'Communication',
          skillsToEncourage: ['Speaks in 4-6 word sentences', 'Asks who, what, where, and why', 'Understands prepositions (on, under, in)'],
          simpleActivity: 'Take turns adding one sentence to make up a silly bedtime story.',
          thingsToObserve: 'Can be understood by strangers about 75% of the time.',
        },
        {
          name: 'Motor Skills',
          skillsToEncourage: ['Pedals a tricycle', 'Cuts paper with safety scissors', 'Catches a large bounced ball'],
          simpleActivity: 'Tearing colorful paper strips and sticking them with non-toxic glue stick.',
          thingsToObserve: 'Holding utensils with fingers rather than whole fist.',
        },
        {
          name: 'Social & Emotional',
          skillsToEncourage: ['Takes turns with assistance', 'Shows empathy when a friend is hurt', 'Engages in rich pretend roles'],
          simpleActivity: 'Set up a pretend doctor clinic for stuffed animals.',
          thingsToObserve: 'Developing friendship bonds and navigating sharing with gentle reminders.',
        },
      ],
      medicalNote: 'Encourage play and curiosity. Consult your pediatrician or early intervention specialist if you have specific concerns.',
    },
  };

  return catalog[ageGroup] || catalog['1-2y'];
}

// Development or production middleware
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, mount Vite's middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`ParentPal AI server listening on http://localhost:${port}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
