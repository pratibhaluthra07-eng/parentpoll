import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateActivity } from '../services/api';
import { ScreenFreeActivity } from '../types';
import {
  Compass,
  Filter,
  Heart,
  Lightbulb,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Timer,
} from 'lucide-react';

const DURATION_FILTERS = ['All', '5 min', '15 min', '30 min'];
const LOCATION_FILTERS = ['All', 'Indoor', 'Outdoor'];
const CATEGORY_FILTERS = [
  'All',
  'Sensory',
  'Motor',
  'Creative',
  'Cognitive',
  'Parent-Child',
  'Independent Play',
];

export const ActivitiesView: React.FC = () => {
  const { activeChild, savedActivities, toggleFavoriteActivity, showNotification } = useApp();

  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [generatedActivity, setGeneratedActivity] = useState<ScreenFreeActivity | null>(null);

  const filteredActivities = savedActivities.filter(act => {
    if (selectedDuration !== 'All' && !act.duration.includes(selectedDuration.replace(' min', ''))) {
      return false;
    }
    if (selectedLocation !== 'All' && act.location !== selectedLocation && act.location !== 'Either') {
      return false;
    }
    if (selectedCategory !== 'All' && act.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await generateActivity(
        selectedCategory === 'All' ? 'Sensory & Motor' : selectedCategory,
        selectedDuration === 'All' ? '15 minutes' : selectedDuration,
        selectedLocation === 'All' ? 'Indoor' : selectedLocation,
        activeChild
      );

      const newAct: ScreenFreeActivity = {
        ...res.data,
        id: `act_gen_${Date.now()}`,
        isFavorite: false,
      };

      setGeneratedActivity(newAct);
      toggleFavoriteActivity(newAct); // save to activities list
      showNotification(`Generated "${newAct.title}"!`);
    } catch (err) {
      showNotification('Failed to generate activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-2 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          Screen-Free Play
        </h1>
        <p className="text-xs text-stone-500">
          Engaging, low-prep developmental activities tailored for{' '}
          <strong className="text-stone-700 dark:text-stone-300">{activeChild.name}</strong> ({activeChild.ageFormatted})
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-4 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
        {/* Category horizontal pills */}
        <div>
          <span className="text-[11px] font-semibold text-stone-500 block mb-1">Play Category</span>
          <div className="flex flex-wrap gap-1">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Location Filters */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 block mb-1">Duration</span>
            <div className="flex gap-1">
              {DURATION_FILTERS.map(dur => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-colors text-center ${
                    selectedDuration === dur
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                      : 'bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-stone-500 block mb-1">Location</span>
            <div className="flex gap-1">
              {LOCATION_FILTERS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-colors text-center ${
                    selectedLocation === loc
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                      : 'bg-stone-100 dark:bg-stone-750 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate on demand button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Finding creative activity for {activeChild.name}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate New Screen-Free Activity</span>
            </>
          )}
        </button>
      </div>

      {/* Activities Grid */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 text-center space-y-2 border border-stone-200 dark:border-stone-700">
            <Compass className="w-8 h-8 text-stone-400 mx-auto" />
            <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
              No activities found for current filters
            </div>
            <p className="text-[11px] text-stone-500">
              Click "Generate New Screen-Free Activity" above to create one right now!
            </p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3.5 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {activity.category}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Timer className="w-3 h-3" />
                      {activity.duration}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
                    {activity.title}
                  </h3>
                </div>

                <button
                  onClick={() => toggleFavoriteActivity(activity)}
                  className={`p-2 rounded-xl border transition-colors ${
                    activity.isFavorite
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-600'
                  }`}
                  title="Favorite activity"
                >
                  <Heart className={`w-4 h-4 ${activity.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Materials Needed */}
              <div className="p-3 bg-stone-50 dark:bg-stone-750/70 rounded-2xl border border-stone-100 dark:border-stone-700 text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200 block mb-1">
                  Materials Needed (Household items):
                </span>
                <p className="text-stone-600 dark:text-stone-300">
                  {activity.materialsNeeded.join(', ')}
                </p>
              </div>

              {/* How to do it */}
              <div>
                <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                  How to do it:
                </div>
                <ol className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300 pl-4 list-decimal">
                  {activity.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* What it develops */}
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  What it develops:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activity.skillsDeveloped.map((skill, sidx) => (
                    <span
                      key={sidx}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              {activity.proTip && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{activity.proTip}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pediatric play disclaimer */}
      <div className="text-[11px] text-stone-400 text-center px-4 leading-relaxed">
        Note: Screen-free activities encourage natural play and connection. They do not claim to guarantee specific developmental outcomes.
      </div>
    </div>
  );
};
