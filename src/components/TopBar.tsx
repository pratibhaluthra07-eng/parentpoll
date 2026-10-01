import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, ChevronDown, Plus, Sparkles, User } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { activeChild, children, setActiveChildId, setIsUrgentModalOpen, setIsOnboardingOpen, setCurrentTab } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-amber-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800 px-4 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20 font-bold text-sm tracking-tight">
              P
            </div>
            <div>
              <span className="font-display font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
                ParentPal<span className="text-amber-600 font-semibold text-xs ml-0.5">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Child Switcher dropdown & Urgent Triage CTA */}
        <div className="flex items-center gap-2">
          {/* Child Picker */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 shadow-2xs hover:bg-stone-50 dark:hover:bg-stone-750 transition-colors"
              aria-label="Switch child"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="font-semibold text-stone-900 dark:text-white max-w-[70px] truncate">
                {activeChild.name}
              </span>
              <span className="text-stone-400 text-[11px]">· {activeChild.ageFormatted}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                  Select Child
                </div>
                {children.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChildId(c.id)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-stone-700/60 transition-colors ${
                      c.id === activeChild.id
                        ? 'text-amber-800 dark:text-amber-400 font-semibold bg-amber-50/50 dark:bg-stone-750'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[10px] text-stone-400">{c.dietaryPreference}</div>
                      </div>
                    </div>
                    {c.id === activeChild.id && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Active</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-stone-100 dark:border-stone-700 my-1"></div>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="w-full px-3 py-1.5 text-left text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 hover:bg-amber-50 dark:hover:bg-stone-700/50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another child</span>
                </button>
              </div>
            )}
          </div>

          {/* Urgent "RIGHT NOW" Button */}
          <button
            onClick={() => setIsUrgentModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs tracking-tight shadow-sm shadow-rose-600/20 active:scale-95 transition-all"
            title="Instant Crisis Triage for Tantrums and Melt Downs"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Right Now</span>
          </button>
        </div>
      </div>
    </header>
  );
};
