import { ChildProfile, ScreenFreeActivity, UserProfile } from '../types';

/**
 * Calculates human-readable age from a date of birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString: string): {
  years: number;
  months: number;
  totalMonths: number;
  formatted: string;
} {
  const birthDate = new Date(dobString);
  const now = new Date();

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (now.getDate() < birthDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);

  let formatted = '';
  if (years === 0) {
    formatted = `${totalMonths} month${totalMonths === 1 ? '' : 's'}`;
  } else if (months === 0) {
    formatted = `${years} year${years === 1 ? '' : 's'}`;
  } else {
    formatted = `${years}y ${months}m`;
  }

  return { years, months, totalMonths, formatted };
}

/**
 * Dynamic friendly greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Sample default user
 */
export const defaultUser: UserProfile = {
  id: 'usr_default',
  name: 'Pratibha',
  location: 'United States',
  parentingGoals: ['Gentle boundaries', 'Toddler nutrition', 'Screen-free activities', 'Better sleep'],
};

/**
 * Calculate dynamic birthdate ~2 years 3 months ago so age is always accurate
 */
function getSampleBirthdate(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Sample initial children profiles
 */
export const defaultChildren: ChildProfile[] = [
  {
    id: 'ch_krisha',
    userId: 'usr_default',
    name: 'Krisha',
    dateOfBirth: getSampleBirthdate(28), // 2 years 4 months old
    gender: 'girl',
    dietaryPreference: 'Vegetarian',
    allergies: ['Peanuts'],
    likes: ['Bananas', 'Oatmeal', 'Paneer', 'Strawberries', 'Coloring', 'Stacking cups'],
    dislikes: ['Broccoli', 'Strong spices', 'Mushy zucchini'],
    sleepSchedule: {
      wakeTime: '07:00 AM',
      napTime: '01:00 PM - 02:30 PM',
      bedtime: '08:00 PM',
      nightWakings: 'Rare (0-1 times)',
    },
    daycareOrHome: 'Home',
    developmentNotes: 'Energetic, loves repeating new words, working on two-footed jumping.',
  },
  {
    id: 'ch_leo',
    userId: 'usr_default',
    name: 'Leo',
    dateOfBirth: getSampleBirthdate(14), // 14 months old
    gender: 'boy',
    dietaryPreference: 'Non-vegetarian',
    allergies: [],
    likes: ['Sweet potato', 'Avocado', 'Yogurt', 'Steamed chicken strips'],
    dislikes: ['Sour fruit', 'Egg yolk when dry'],
    sleepSchedule: {
      wakeTime: '06:30 AM',
      napTime: '12:30 PM - 02:30 PM',
      bedtime: '07:30 PM',
      nightWakings: '1-2 brief night resets',
    },
    daycareOrHome: 'Daycare',
    developmentNotes: 'Cruising along furniture, testing balance, loves clapping to songs.',
  },
];

/**
 * Initial curated library of screen-free activities
 */
export const initialActivities: ScreenFreeActivity[] = [
  {
    id: 'act_1',
    title: 'Color Sorting Cups & Pompoms',
    ageRange: '18m - 3y',
    duration: '15 min',
    location: 'Indoor',
    category: 'Sensory',
    materialsNeeded: ['3-4 colored plastic or paper cups', 'Soft pompoms or large colored buttons', 'Toddler kitchen tongs (optional)'],
    steps: [
      'Set out three different colored cups in a row.',
      'Place a small bowl of matching colored pompoms or toys in front of your toddler.',
      'Model putting one red item into the red cup and say, "Red goes to red!".',
      'Invite your child to sort the rest using their fingers or plastic tongs.',
    ],
    skillsDeveloped: ['Color recognition', 'Pincer grasp', 'Hand-eye coordination', 'Focused attention'],
    proTip: 'If your child just likes dumping them all out, celebrate that too! Dumping is an important schema.',
    isFavorite: true,
  },
  {
    id: 'act_2',
    title: 'Baking Sheet Water & Floating Toys',
    ageRange: '12m - 4y',
    duration: '20 min',
    location: 'Indoor',
    category: 'Sensory',
    materialsNeeded: ['Rimmed baking sheet or plastic tub', 'A towel underneath', '1 inch of lukewarm water', 'Plastic spoons & floating bath toys'],
    steps: [
      'Lay a towel on the kitchen floor and place a rimmed sheet filled with 1 inch of warm water on it.',
      'Drop in floating items: plastic caps, small toy boats, or foam cutouts.',
      'Give your toddler a slotted spoon or measuring scoop to "fish" for items.',
      'Let them splash, scoop, and pour into a small empty cup.',
    ],
    skillsDeveloped: ['Bilateral hand coordination', 'Cause and effect', 'Sensory regulation'],
    proTip: 'A great 4:00 PM pre-dinner "witching hour" calming reset when parents need to cook.',
    isFavorite: true,
  },
  {
    id: 'act_3',
    title: 'Living Room Pillow Mountain Climb',
    ageRange: '14m - 3y',
    duration: '15 min',
    location: 'Indoor',
    category: 'Motor',
    materialsNeeded: ['Couch cushions', 'Bed pillows', 'Soft blanket'],
    steps: [
      'Stack cushions of varying heights on a soft carpeted area.',
      'Drape a blanket over the pillows to create a continuous soft hill.',
      'Encourage your toddler to crawl, climb, and balance over the obstacle course.',
      'Cheer as they reach the other side!',
    ],
    skillsDeveloped: ['Gross motor balance', 'Proprioceptive input', 'Core strength'],
    proTip: 'High proprioceptive activities like heavy climbing help calm an overstimulated toddler before bedtime.',
    isFavorite: false,
  },
  {
    id: 'act_4',
    title: 'Cardboard Box "Car Wash" & Painting',
    ageRange: '2y - 5y',
    duration: '30 min',
    location: 'Indoor',
    category: 'Creative',
    materialsNeeded: ['A clean medium or large delivery cardboard box', 'Washable crayons or washable dot markers', 'Toy cars'],
    steps: [
      'Open the cardboard flaps and place your child right inside the box.',
      'Hand them washable chunky markers or crayons.',
      'Let them freely draw "roads", "tunnels", and scenery inside the box walls.',
      'Drive toy cars along the newly created tracks.',
    ],
    skillsDeveloped: ['Spatial awareness', 'Pretend play', 'Fine motor pencil grip'],
    proTip: 'Sitting inside a confined box provides deep comfort and security for toddlers experiencing sensory overload.',
    isFavorite: false,
  },
  {
    id: 'act_5',
    title: 'Nature Treasure Hunt Walk',
    ageRange: '18m - 6y',
    duration: '20 min',
    location: 'Outdoor',
    category: 'Parent-Child',
    materialsNeeded: ['Small paper bag or egg carton with handle'],
    steps: [
      'Take a gentle walk around the yard, park, or sidewalk.',
      'Ask your child to find 3 distinct natural items: a smooth gray pebble, a crunchy fallen leaf, and a small twig.',
      'Let them hold and examine the textures with their fingers.',
      'Place each treasure into their little bag to bring home.',
    ],
    skillsDeveloped: ['Observation & descriptive vocabulary', 'Nature connection', 'Gross motor walking stamina'],
    proTip: 'Keep expectations low—even stopping to inspect an ant on a dandelion for 5 minutes is a win.',
    isFavorite: true,
  },
];
