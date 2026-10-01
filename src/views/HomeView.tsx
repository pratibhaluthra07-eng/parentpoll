import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGreeting } from '../utils/helpers';
import {
  AlertCircle,
  Apple,
  ArrowRight,
  Brain,
  ChevronRight,
  Clock,
  Compass,
  MessageSquare,
  MessageSquareQuote,
  Moon,
  Send,
  Sparkles,
  Utensils,
} from 'lucide-react';

const EXAMPLE_PROMPTS = [
  "She didn't eat lunch today.",
  'What can I make with banana and oats?',
  'Why is she waking up at night?',
  'Give me a screen-free activity.',
  'She keeps throwing food.',
  'Can my toddler eat mushrooms?',
];

export const HomeView: React.FC = () => {
  const {
    user,
    activeChild,
    setCurrentTab,
    createConversation,
    setIsUrgentModalOpen,
    conversations,
    setActiveConversationId,
  } = useApp();

  const [promptInput, setPromptInput] = useState('');

  const greeting = getGreeting();

  const handleStartChat = (queryText: string) => {
    if (!queryText.trim()) return;
    const convId = createConversation(queryText);
    setCurrentTab('chat');
    // Store in session so ChatView can immediately trigger it
    sessionStorage.setItem('pending_chat_query', queryText);
    setPromptInput('');
  };

  const handleActionCard = (tab: 'food' | 'activities' | 'sleep' | 'development' | 'chat', topic?: string) => {
    if (topic) {
      handleStartChat(topic);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="pb-24 pt-2 space-y-5 animate-in fade-in duration-150">
      {/* Top Greeting & Child context banner */}
      <section className="bg-gradient-to-b from-amber-100/60 to-amber-50/20 dark:from-stone-800/80 dark:to-stone-900/40 rounded-3xl p-5 border border-amber-200/50 dark:border-stone-800">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
            ParentPal AI Companion
          </span>
          <span className="text-xs text-stone-500">
            {activeChild.name} · {activeChild.ageFormatted}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-display text-stone-900 dark:text-stone-100 leading-tight">
          {greeting}, {user.name} 👋
        </h1>
        <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">
          How can I help with <span className="font-semibold text-stone-800 dark:text-stone-200">{activeChild.name}</span> today?
        </p>

        {/* Large AI Question Input Box */}
        <div className="mt-4 bg-white dark:bg-stone-800/90 rounded-2xl p-2 sm:p-2.5 shadow-sm border border-stone-200 dark:border-stone-700 flex items-center gap-2 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 transition-all">
          <input
            type="text"
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStartChat(promptInput)}
            placeholder={`Ask me anything about ${activeChild.name}...`}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none"
          />
          <button
            onClick={() => handleStartChat(promptInput)}
            disabled={!promptInput.trim()}
            className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:hover:bg-amber-600 transition-all shadow-xs"
            aria-label="Send prompt"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Example Prompt Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleStartChat(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-800/80 hover:bg-white dark:hover:bg-stone-750 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 hover:border-amber-400 transition-colors text-left"
            >
              “{prompt}”
            </button>
          ))}
        </div>
      </section>

      {/* Prominent Emergency Parenting Banner */}
      <section className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold shadow-sm shadow-rose-600/30">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
              Emergency Tantrum & Meltdown Help
            </div>
            <div className="text-xs text-rose-700 dark:text-rose-300">
              Immediate 60-second calming steps for tough parenting moments.
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsUrgentModalOpen(true)}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shrink-0 active:scale-95 transition-all shadow-xs"
        >
          Right Now
        </button>
      </section>

      {/* Quick-Action Cards */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
            Quick Actions
          </h2>
          <span className="text-[11px] text-stone-500 font-medium">Tailored for {activeChild.ageFormatted}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <button
            onClick={() => handleActionCard('food')}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Food & Meals</span>
            <span className="text-[10px] text-stone-500">Pantry & recipes</span>
          </button>

          <button
            onClick={() => handleActionCard('sleep')}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Sleep</span>
            <span className="text-[10px] text-stone-500">Wake windows</span>
          </button>

          <button
            onClick={() => handleActionCard('development')}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Development</span>
            <span className="text-[10px] text-stone-500">Gentle milestones</span>
          </button>

          <button
            onClick={() => handleActionCard('activities')}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Activities</span>
            <span className="text-[10px] text-stone-500">Screen-free play</span>
          </button>

          <button
            onClick={() => handleActionCard('chat', `How can I handle ${activeChild.name}'s toddler boundary testing calmly?`)}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Behavior</span>
            <span className="text-[10px] text-stone-500">Gentle boundaries</span>
          </button>

          <button
            onClick={() => handleActionCard('chat', `What is a calm daily routine schedule for a ${activeChild.ageFormatted} toddler?`)}
            className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Daily Routine</span>
            <span className="text-[10px] text-stone-500">Easy rhythm</span>
          </button>
        </div>
      </section>

      {/* "Today for [Child Name]" Highlight Card */}
      <section className="bg-white dark:bg-stone-800 rounded-3xl p-5 border border-stone-200/80 dark:border-stone-700/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              ★
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
                Today for {activeChild.name}
              </h3>
              <p className="text-[11px] text-stone-500">
                {activeChild.ageFormatted} · {activeChild.dietaryPreference}
                {activeChild.allergies?.length ? ` · Allergy safe (${activeChild.allergies.join(', ')})` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Meal suggestion */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-750/50 border border-stone-100 dark:border-stone-700">
            <div className="p-2 rounded-xl bg-amber-100/70 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shrink-0">
              <Apple className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Meal Idea
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Soft Banana Oat Bites & Whipped Curd
              </div>
              <div className="text-xs text-stone-500 leading-snug mt-0.5">
                Quick 10-minute finger snack high in potassium, gentle on tummy, and peanut-free.
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('food')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold shrink-0"
            >
              Food Hub →
            </button>
          </div>

          {/* Activity suggestion */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-750/50 border border-stone-100 dark:border-stone-700">
            <div className="p-2 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Screen-Free Activity
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Color Sorting Cups & Pompoms (15 min)
              </div>
              <div className="text-xs text-stone-500 leading-snug mt-0.5">
                Strengthens pincer grasp and color matching using simple kitchen cups.
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('activities')}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold shrink-0"
            >
              Play Hub →
            </button>
          </div>

          {/* Sleep reminder */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-750/50 border border-stone-100 dark:border-stone-700">
            <div className="p-2 rounded-xl bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider">
                Sleep Rhythm
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Bedtime target: {activeChild.sleepSchedule.bedtime}
              </div>
              <div className="text-xs text-stone-500 leading-snug mt-0.5">
                Begin wind-down (dim lights, 2 storybooks) ~30 mins before sleep to ease transition.
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('sleep')}
              className="text-xs text-indigo-700 dark:text-indigo-400 hover:underline font-semibold shrink-0"
            >
              Routine →
            </button>
          </div>
        </div>
      </section>

      {/* Recent Conversations */}
      {conversations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
              Recent Conversations
            </h2>
            <button
              onClick={() => setCurrentTab('chat')}
              className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline"
            >
              View all ({conversations.length})
            </button>
          </div>

          <div className="space-y-2">
            {conversations.slice(0, 3).map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setCurrentTab('chat');
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 hover:border-amber-400 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {conv.title}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {conv.category} · {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
