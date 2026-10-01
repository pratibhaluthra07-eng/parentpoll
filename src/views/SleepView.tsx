import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Moon,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react';

export const SleepView: React.FC = () => {
  const { activeChild, updateChild, showNotification, setCurrentTab, createConversation } = useApp();

  const [wakeTime, setWakeTime] = useState(activeChild.sleepSchedule.wakeTime || '07:00 AM');
  const [napTime, setNapTime] = useState(activeChild.sleepSchedule.napTime || '01:00 PM - 02:30 PM');
  const [bedtime, setBedtime] = useState(activeChild.sleepSchedule.bedtime || '08:00 PM');
  const [nightWakings, setNightWakings] = useState(activeChild.sleepSchedule.nightWakings || '0-1 times');

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    '30m Screen-Free Reset': true,
    'Warm Bath or Wash': true,
    'Dim Amber / Red Lighting': false,
    '2 Short Storybooks': false,
    'White Noise / Fan running': true,
    'Comfort Bedtime Phrase': false,
  });

  const toggleCheck = (item: string) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const handleSaveSchedule = () => {
    updateChild(activeChild.id, {
      sleepSchedule: {
        wakeTime,
        napTime,
        bedtime,
        nightWakings,
      },
    });
    showNotification('Sleep schedule updated');
  };

  const handleAskSleepAI = (query: string) => {
    createConversation(query, 'Sleep');
    setCurrentTab('chat');
    sessionStorage.setItem('pending_chat_query', query);
  };

  return (
    <div className="pb-24 pt-2 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          Sleep & Bedtime Rhythm
        </h1>
        <p className="text-xs text-stone-500">
          Age-appropriate wake windows, calming wind-down, and routine for{' '}
          <strong className="text-stone-700 dark:text-stone-300">{activeChild.name}</strong> ({activeChild.ageFormatted})
        </p>
      </div>

      {/* Routine Tracker & Schedule Editor Card */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                {activeChild.name}'s Current Sleep Schedule
              </h3>
              <p className="text-[11px] text-stone-500">Typical wake window target: 5 – 5.5 hours</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Wake Time
            </label>
            <input
              type="text"
              value={wakeTime}
              onChange={e => setWakeTime(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Nap Window
            </label>
            <input
              type="text"
              value={napTime}
              onChange={e => setNapTime(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Bedtime Target
            </label>
            <input
              type="text"
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-white"
            />
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700">
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
              Night Wakings
            </label>
            <input
              type="text"
              value={nightWakings}
              onChange={e => setNightWakings(e.target.value)}
              className="w-full bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-600 text-xs font-semibold text-stone-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSaveSchedule}
          className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
        >
          Save Schedule Updates
        </button>
      </div>

      {/* Bedtime Wind-Down Ritual Checklist */}
      <div className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Calm Bedtime Wind-Down Checklist
            </h3>
            <p className="text-[11px] text-stone-500">Predictable 25-minute sequence eases cortisol and signals melatonin</p>
          </div>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
            {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length}
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(checklist).map(([item, checked]) => (
            <button
              key={item}
              onClick={() => toggleCheck(item)}
              className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition-all ${
                checked
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                  : 'bg-stone-50 dark:bg-stone-750 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <span className={checked ? 'line-through text-stone-400' : 'font-medium'}>{item}</span>
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                  checked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                }`}
              >
                {checked && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep Hygiene & Wake Window Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 space-y-2 text-xs">
          <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            Age-Appropriate Wake Windows
          </div>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
            For a toddler around {activeChild.ageFormatted}:
          </p>
          <ul className="space-y-1 text-stone-600 dark:text-stone-400 list-disc pl-4">
            <li>Morning wake window: ~5 hours</li>
            <li>Single daytime nap: 1.5 to 2 hours</li>
            <li>Afternoon wake window: ~5.5 hours before bedtime</li>
            <li>Total daily sleep target: 11 to 13 hours</li>
          </ul>
        </div>

        <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
          <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Sleep Troubleshooting Prompts
          </div>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
            Need tailored troubleshooting? Click to ask the AI:
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => handleAskSleepAI(`Why is ${activeChild.name} waking up crying around midnight?`)}
              className="w-full text-left p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-600 hover:border-amber-400 text-[11px] font-medium text-stone-800 dark:text-stone-200"
            >
              “Why is she waking up at midnight?”
            </button>
            <button
              onClick={() => handleAskSleepAI(`How can I prevent ${activeChild.name} from running out of bed 5 times?`)}
              className="w-full text-left p-2 rounded-xl bg-white dark:bg-stone-750 border border-stone-200 dark:border-stone-600 hover:border-amber-400 text-[11px] font-medium text-stone-800 dark:text-stone-200"
            >
              “She keeps popping out of bed”
            </button>
          </div>
        </div>
      </div>

      {/* Medical disclaimer */}
      <div className="p-3 bg-stone-100/60 dark:bg-stone-800/60 rounded-2xl text-[11px] text-stone-500 flex items-start gap-2 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <span>
          ParentPal AI provides general parenting and routine hygiene suggestions. It does not diagnose sleep disorders or medical sleep apnea. Discuss persistent sleep concerns with your pediatrician.
        </span>
      </div>
    </div>
  );
};
