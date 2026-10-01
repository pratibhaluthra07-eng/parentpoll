import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DietaryPreference } from '../types';
import { calculateAge } from '../utils/helpers';
import { Baby, Calendar, Check, Heart, Sparkles, User, X } from 'lucide-react';

const COMMON_ALLERGIES = ['Peanuts', 'Tree nuts', 'Cow Milk / Dairy', 'Eggs', 'Soy', 'Wheat / Gluten', 'Fish / Shellfish', 'Sesame'];
const COMMON_GOALS = ['Gentle boundaries & discipline', 'Picky eating & healthy meals', 'Predictable sleep & bedtime', 'Screen-free active play', 'Potty training readiness', 'Speech & language development'];

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, user, updateUser, addChild } = useApp();

  const [step, setStep] = useState<1 | 2>(1);

  // Parent form state
  const [parentName, setParentName] = useState(user.name || '');
  const [parentLocation, setParentLocation] = useState(user.location || '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.parentingGoals || []);

  // Child form state
  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('2024-05-15');
  const [gender, setGender] = useState<'girl' | 'boy' | 'neutral' | 'prefer-not-to-say'>('girl');
  const [diet, setDiet] = useState<DietaryPreference>('Vegetarian');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [likesInput, setLikesInput] = useState('Bananas, Sweet potato, Oatmeal');
  const [dislikesInput, setDislikesInput] = useState('Broccoli, Strong spices');
  const [wakeTime, setWakeTime] = useState('07:00 AM');
  const [napTime, setNapTime] = useState('01:00 PM - 02:30 PM');
  const [bedtime, setBedtime] = useState('08:00 PM');
  const [careSetting, setCareSetting] = useState<'Home' | 'Daycare' | 'Both'>('Home');
  const [notes, setNotes] = useState('');

  if (!isOnboardingOpen) return null;

  const agePreview = dob ? calculateAge(dob).formatted : '';

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;

    // Update parent
    updateUser({
      name: parentName.trim() || 'Parent',
      location: parentLocation.trim() || undefined,
      parentingGoals: selectedGoals,
    });

    // Add child
    addChild({
      name: childName.trim(),
      dateOfBirth: dob,
      gender,
      dietaryPreference: diet,
      allergies,
      likes: likesInput.split(',').map(s => s.trim()).filter(Boolean),
      dislikes: dislikesInput.split(',').map(s => s.trim()).filter(Boolean),
      sleepSchedule: {
        wakeTime,
        napTime,
        bedtime,
      },
      daycareOrHome: careSetting,
      developmentNotes: notes.trim() || undefined,
    });

    setIsOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              {step === 1 ? '1/2' : '2/2'}
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                {step === 1 ? 'About You' : 'About Your Child'}
              </h2>
              <p className="text-xs text-stone-500">
                {step === 1 ? 'Personalize your companion' : 'Helps ParentPal AI tailor meals, sleep, and answers'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-4 sm:p-5 space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder="e.g. Pratibha, Alex, Sarah"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={parentLocation}
                  onChange={e => setParentLocation(e.target.value)}
                  placeholder="e.g. Austin, Texas or Mumbai, India"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                  What are your top parenting goals right now?
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {COMMON_GOALS.map(goal => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        type="button"
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                            : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-300'
                        }`}
                      >
                        <span>{goal}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-800"
                >
                  Continue to Child Profile →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Child's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={e => setChildName(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1 flex items-center justify-between">
                    <span>Date of Birth *</span>
                    {agePreview && <span className="text-[11px] text-amber-700 font-bold">{agePreview}</span>}
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Dietary Preference & Care Setting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={diet}
                    onChange={e => setDiet(e.target.value as DietaryPreference)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-vegetarian">Non-vegetarian</option>
                    <option value="Eggitarian">Eggitarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Daycare or Home
                  </label>
                  <select
                    value={careSetting}
                    onChange={e => setCareSetting(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Home">Home full-time</option>
                    <option value="Daycare">Daycare / Preschool</option>
                    <option value="Both">Both (part-time)</option>
                  </select>
                </div>
              </div>

              {/* Allergies Selection */}
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Known Food Allergies (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ALLERGIES.map(item => {
                    const isChecked = allergies.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleAllergy(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isChecked
                            ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {item} {isChecked && '✓'}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAllergy}
                    onChange={e => setCustomAllergy(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomAllergy();
                      }
                    }}
                    placeholder="Other allergy..."
                    className="flex-1 px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergy}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg text-xs font-medium text-stone-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Likes & Dislikes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Foods child likes
                  </label>
                  <input
                    type="text"
                    value={likesInput}
                    onChange={e => setLikesInput(e.target.value)}
                    placeholder="Bananas, curd, rice..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Foods child dislikes
                  </label>
                  <input
                    type="text"
                    value={dislikesInput}
                    onChange={e => setDislikesInput(e.target.value)}
                    placeholder="Broccoli, onions..."
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Typical Schedule */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Wake Time</label>
                  <input
                    type="text"
                    value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Nap Time</label>
                  <input
                    type="text"
                    value={napTime}
                    onChange={e => setNapTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">Bedtime</label>
                  <input
                    type="text"
                    value={bedtime}
                    onChange={e => setBedtime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Developmental or personality notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Very curious, sensitive to loud sounds, loves animals..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-800"
                >
                  ← Back to Parent Info
                </button>
                <button
                  type="submit"
                  disabled={!childName.trim()}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-amber-600/20 disabled:opacity-40"
                >
                  Save Child Profile & Finish
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
