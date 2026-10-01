import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { Home, MessageSquareQuote, UtensilsCrossed, Sparkles, User, Moon, Compass } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Ask AI', icon: MessageSquareQuote },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'activities', label: 'Play', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-all relative ${
                isActive
                  ? 'text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-100/70 dark:bg-amber-950/60 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full absolute bottom-1.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
