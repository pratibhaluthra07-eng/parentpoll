import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDevelopmentMilestones } from '../services/api';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Eye,
  Heart,
  HelpCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const AGE_RANGES = [
  { id: '1-2y', label: '1 – 2 Years', subtitle: 'Walking & First Words' },
  { id: '2-3y', label: '2 – 3 Years', subtitle: 'Curious Explorer' },
  { id: '3-4y', label: '3 – 4 Years', subtitle: 'Language & Social Play' },
];

export const DevelopmentView: React.FC = () => {
  const { activeChild, setCurrentTab, createConversation } = useApp();

  // Select appropriate default based on child's age
  const initialRange =
    activeChild.ageYears < 2 ? '1-2y' : activeChild.ageYears < 3 ? '2-3y' : '3-4y';

  const [selectedAge, setSelectedAge] = useState(initialRange);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadMilestones(selectedAge);
  }, [selectedAge]);

  const loadMilestones = async (age: string) => {
    setLoading(true);
    try {
      const res = await getDevelopmentMilestones(age);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAIAboutMilestone = (topic: string) => {
    const q = `How can I gently encourage ${activeChild.name}'s ${topic.toLowerCase()} at ${activeChild.ageFormatted}?`;
    createConversation(q, 'Development');
    setCurrentTab('chat');
    sessionStorage.setItem('pending_chat_query', q);
  };

  return (
    <div className="pb-24 pt-2 space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-stone-900 dark:text-stone-100">
          Development & Milestones
        </h1>
        <p className="text-xs text-stone-500">
          Gentle, non-judgmental developmental insights for{' '}
          <strong className="text-stone-700 dark:text-stone-300">{activeChild.name}</strong> ({activeChild.ageFormatted})
        </p>
      </div>

      {/* Age Group Switcher */}
      <div className="grid grid-cols-3 gap-2">
        {AGE_RANGES.map(range => (
          <button
            key={range.id}
            onClick={() => setSelectedAge(range.id)}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedAge === range.id
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-300'
            }`}
          >
            <div className="text-xs font-bold">{range.label}</div>
            <div
              className={`text-[10px] mt-0.5 truncate ${
                selectedAge === range.id ? 'text-white/80' : 'text-stone-400'
              }`}
            >
              {range.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* Reassurance Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
        <Heart className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Development is a continuum, not a test:</span> Every child learns, talks, and climbs at their own individual pace. These observations are joyful guides, never strict pass/fail exams.
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <p className="text-xs text-stone-500">Loading developmental guide...</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          <div className="text-xs text-stone-500 px-1">
            Overview: {data.overview}
          </div>

          <div className="space-y-3.5">
            {data.categories.map((cat: any, i: number) => (
              <div
                key={i}
                className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-700">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-600" />
                    <span>{cat.name}</span>
                  </h3>
                  <button
                    onClick={() => handleAskAIAboutMilestone(cat.name)}
                    className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ask AI</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Skills to encourage */}
                <div>
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Common Skills to Gently Encourage
                  </div>
                  <ul className="space-y-1 text-xs text-stone-800 dark:text-stone-200">
                    {cat.skillsToEncourage.map((skill: string, sidx: number) => (
                      <li key={sidx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Simple Activity */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-750 border border-stone-100 dark:border-stone-700 text-xs">
                  <span className="font-bold text-stone-800 dark:text-stone-200 block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Playful Idea to Try at Home:
                  </span>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                    {cat.simpleActivity}
                  </p>
                </div>

                {/* Things to Observe */}
                <div className="text-xs text-stone-500 flex items-start gap-2 pt-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-stone-700 dark:text-stone-300">Observation: </strong>
                    {cat.thingsToObserve}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Medical disclaimer note */}
          <div className="p-4 rounded-3xl bg-stone-100/70 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
              <AlertCircle className="w-4 h-4 text-stone-500" />
              <span>When to Speak with Your Pediatrician</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If your child has lost previously acquired skills, does not make eye contact, does not respond to sounds, or if your parental intuition feels something needs checking, schedule a chat with your pediatrician or early intervention program. Early support is always empowering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
