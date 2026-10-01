import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Baby,
  Check,
  Edit2,
  Heart,
  Plus,
  Shield,
  Trash2,
  User,
  Utensils,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    children,
    activeChild,
    setActiveChildId,
    deleteChild,
    setIsOnboardingOpen,
    savedActivities,
    showNotification,
  } = useApp();

  const [isEditingParent, setIsEditingParent] = useState(false);
  const [parentName, setParentName] = useState(user.name);
  const [parentLocation, setParentLocation] = useState(user.location || '');

  const favoriteActivities = savedActivities.filter(a => a.isFavorite);

  const handleSaveParent = () => {
    updateUser({
      name: parentName,
      location: parentLocation,
    });
    setIsEditingParent(false);
  };

  return (
    <div className="pb-24 pt-2 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          Family Profile & Settings
        </h1>
        <p className="text-xs text-stone-500">
          Manage children profiles, learned dietary preferences, and settings
        </p>
      </div>

      {/* Parent Information Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Parent: {user.name}
              </h3>
              <p className="text-[11px] text-stone-500">{user.location || 'Location not specified'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingParent(!isEditingParent)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {isEditingParent ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingParent ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">Parent Name</label>
              <input
                type="text"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1">Location</label>
              <input
                type="text"
                value={parentLocation}
                onChange={e => setParentLocation(e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-xl text-xs"
              />
            </div>
            <button
              onClick={handleSaveParent}
              className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold rounded-xl"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div>
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
              Parenting Goals:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.parentingGoals?.map(goal => (
                <span
                  key={goal}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-750 text-stone-700 dark:text-stone-300 font-medium"
                >
                  ✓ {goal}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Child Profiles Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
            Children ({children.length})
          </h2>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {children.map(child => {
            const isActive = child.id === activeChild.id;
            return (
              <div
                key={child.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isActive
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700 shadow-xs'
                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-700/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-200/80 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 font-bold text-xs flex items-center justify-center">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {child.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                            Current Active
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500">
                        DOB: {child.dateOfBirth} · {child.dietaryPreference}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isActive && (
                      <button
                        onClick={() => {
                          setActiveChildId(child.id);
                          showNotification(`Switched active profile to ${child.name}`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold"
                      >
                        Switch
                      </button>
                    )}
                    {children.length > 1 && (
                      <button
                        onClick={() => deleteChild(child.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600"
                        title="Delete child profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details snapshot */}
                <div className="pt-2 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">Allergies:</span>
                    <span>{child.allergies?.length ? child.allergies.join(', ') : 'None reported'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">Likes:</span>
                    <span>{child.likes?.length ? child.likes.join(', ') : 'None listed'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">Dislikes:</span>
                    <span>{child.dislikes?.length ? child.dislikes.join(', ') : 'None listed'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-500 text-[11px] pt-1">
                    <span>Routine: Wake {child.sleepSchedule.wakeTime} · Bed {child.sleepSchedule.bedtime} · {child.daycareOrHome}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Favorite Screen-Free Activities */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Favorited Activities ({favoriteActivities.length})
            </h3>
          </div>
        </div>

        {favoriteActivities.length === 0 ? (
          <p className="text-xs text-stone-400 py-2">No activities favorited yet. Click the heart icon on any activity!</p>
        ) : (
          <div className="space-y-2">
            {favoriteActivities.map(act => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-900 dark:text-stone-100">{act.title}</div>
                  <div className="text-[11px] text-stone-500">{act.duration} · {act.category}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust & Safety Disclaimer Card */}
      <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 space-y-2 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
        <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600" />
          <span>ParentPal AI Safety Commitment</span>
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-400">
          ParentPal AI is designed to support parents with everyday non-medical challenges—such as toddler boundary testing, picky eating, bedtime wind-down, and screen-free routines.
        </p>
        <p className="text-[11px] text-stone-600 dark:text-stone-400">
          It is not a replacement for clinical advice from a pediatrician, pediatric dietitian, psychologist, or emergency medical services. Always contact emergency healthcare immediately if your child has difficulty breathing, loss of consciousness, serious injury, seizure, high fever, or ingestion of a toxic substance.
        </p>
      </div>
    </div>
  );
};
