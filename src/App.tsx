/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { UrgentTriageModal } from './components/UrgentTriageModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeView } from './views/HomeView';
import { ChatView } from './views/ChatView';
import { FoodView } from './views/FoodView';
import { ActivitiesView } from './views/ActivitiesView';
import { SleepView } from './views/SleepView';
import { DevelopmentView } from './views/DevelopmentView';
import { ProfileView } from './views/ProfileView';
import { Check } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { currentTab, notification } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex justify-center selection:bg-amber-200">
      {/* Mobile-constrained viewport shell */}
      <div className="w-full max-w-md min-h-screen bg-amber-50/30 dark:bg-stone-900 border-x border-stone-200/80 dark:border-stone-800 flex flex-col relative shadow-2xl">
        {/* Fixed Top Bar */}
        <TopBar />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="w-4 h-4 rounded-full bg-emerald-500 text-stone-900 flex items-center justify-center font-bold text-[10px]">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>{notification}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-1">
          {currentTab === 'home' && <HomeView />}
          {currentTab === 'chat' && <ChatView />}
          {currentTab === 'food' && <FoodView />}
          {currentTab === 'activities' && <ActivitiesView />}
          {currentTab === 'sleep' && <SleepView />}
          {currentTab === 'development' && <DevelopmentView />}
          {currentTab === 'profile' && <ProfileView />}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav />

        {/* Floating Modals */}
        <UrgentTriageModal />
        <OnboardingModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppLayout />
    </AppProvider>
  );
}
