import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getUrgentTriage } from '../services/api';
import { UrgentTriageResult } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, HeartHandshake, Loader2, Volume2, X, XCircle } from 'lucide-react';

const COMMON_SITUATIONS = [
  'Toddler having a full meltdown / tantrum',
  'Refusing to eat dinner or pushing plate',
  'Bedtime battle / won\'t stay in bed',
  'Hitting, biting, or throwing toys',
  'Refusing to brush teeth',
  'Meltdown leaving the playground / park',
  'Crying hysterically and won\'t calm down',
  'Screaming when getting in the car seat',
];

export const UrgentTriageModal: React.FC = () => {
  const { isUrgentModalOpen, setIsUrgentModalOpen, activeChild } = useApp();
  const [selectedSituation, setSelectedSituation] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrgentTriageResult | null>(null);
  const [isMedical, setIsMedical] = useState(false);

  if (!isUrgentModalOpen) return null;

  const handleTriage = async (situationText: string) => {
    if (!situationText.trim()) return;
    setLoading(true);
    setResult(null);
    setSelectedSituation(situationText);

    try {
      const response = await getUrgentTriage(situationText, activeChild);
      setResult(response.data);
      setIsMedical(!!response.isEmergency);
    } catch (err) {
      // Fallback
      setResult({
        rightNow: [
          'Get down on eye level and take 1 slow deep breath.',
          'Speak in a calm whisper: low pitch signals safety.',
          'Keep your hands gentle and present without forcing or restraining.',
        ],
        whatToSay: `I'm right here with you, ${activeChild.name}. You are safe.`,
        whatNotToDo: [
          'Do not try to reason or explain right now while their brain is in fight-or-flight.',
          'Do not yell or ask "Why did you do that?".',
        ],
        calmReminder: 'Drop your shoulders and unclench your jaw. You are the calm anchor.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedSituation('');
    setCustomInput('');
    setIsMedical(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col">
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 sm:hidden"></div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-display">
                What Do I Do Right Now?
              </h2>
              <p className="text-xs text-stone-500">
                Calm 60-second crisis guidance for <span className="font-semibold text-stone-700 dark:text-stone-300">{activeChild.name}</span> ({activeChild.ageFormatted})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              setIsUrgentModalOpen(false);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Medical emergency warning if detected */}
          {isMedical && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200">
                <span className="font-bold block">Medical Warning</span>
                If your child is having trouble breathing, lethargic, or showing allergic reaction signs, contact emergency services immediately (911 / 112).
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-2">
                  Select what is happening right now:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_SITUATIONS.map((sit, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriage(sit)}
                      className="text-left p-3 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-amber-50/50 text-xs font-medium text-stone-800 dark:text-stone-200 transition-all flex items-center justify-between group active:scale-[0.99]"
                    >
                      <span>{sit}</span>
                      <span className="text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-bold ml-1">→</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1"></div>
                  <span className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">Or type your situation</span>
                  <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1"></div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTriage(customInput)}
                    placeholder="e.g. She won't let me buckle the car seat..."
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => handleTriage(customInput)}
                    disabled={!customInput.trim()}
                    className="px-4 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Help
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                Finding the calmest next step...
              </div>
              <p className="text-xs text-stone-400 max-w-xs">
                Take one deep breath and drop your shoulders while we organize the immediate response.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Situation Header */}
              <div className="text-xs text-stone-500 pb-1 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span>Situation: <strong className="text-stone-800 dark:text-stone-200">{selectedSituation}</strong></span>
                <button
                  onClick={handleReset}
                  className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
                >
                  Change
                </button>
              </div>

              {/* What to do RIGHT NOW */}
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/60 rounded-2xl p-4">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  Right Now (Next 60 seconds)
                </div>
                <ol className="space-y-2 text-xs text-stone-800 dark:text-stone-200">
                  {result.rightNow.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-200/80 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* What to Say */}
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-4">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  What to say (Word for word)
                </div>
                <div className="p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-900 dark:text-white italic leading-relaxed">
                  "{result.whatToSay}"
                </div>
              </div>

              {/* What NOT to do */}
              <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 rounded-2xl p-4">
                <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  What NOT to do
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                  {result.whatNotToDo.map((avoid, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{avoid}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grounding Reminder */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{result.calmReminder}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Non-medical parenting support
          </span>
          <button
            onClick={() => {
              handleReset();
              setIsUrgentModalOpen(false);
            }}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:bg-stone-800"
          >
            {result ? 'Done / Back' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
