import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChildProfile, Conversation, Message, ScreenFreeActivity, UserProfile } from '../types';
import { calculateAge, defaultChildren, defaultUser, initialActivities } from '../utils/helpers';

export type NavigationTab = 'home' | 'chat' | 'food' | 'activities' | 'sleep' | 'development' | 'profile';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  children: ChildProfile[];
  activeChildId: string;
  activeChild: ChildProfile & {
    ageFormatted: string;
    ageMonths: number;
    ageYears: number;
  };
  setActiveChildId: (id: string) => void;
  addChild: (childData: Omit<ChildProfile, 'id' | 'userId'>) => string;
  updateChild: (id: string, updates: Partial<ChildProfile>) => void;
  deleteChild: (id: string) => void;

  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string, category?: Conversation['category']) => string;
  addMessageToConversation: (
    conversationId: string,
    message: Omit<Message, 'id' | 'timestamp' | 'conversationId'>
  ) => void;
  deleteConversation: (conversationId: string) => void;

  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isUrgentModalOpen: boolean;
  setIsUrgentModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  savedActivities: ScreenFreeActivity[];
  toggleFavoriteActivity: (activity: ScreenFreeActivity) => void;

  notification: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children: reactChildren }) => {
  // Load initial states from localStorage if available
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('parentpal_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem('parentpal_children');
    return saved ? JSON.parse(saved) : defaultChildren;
  });

  const [activeChildId, setActiveChildId] = useState<string>(() => {
    const saved = localStorage.getItem('parentpal_active_child_id');
    return saved && childrenList.some(c => c.id === saved)
      ? saved
      : childrenList[0]?.id || 'ch_krisha';
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('parentpal_conversations');
    if (saved) return JSON.parse(saved);

    // Initial conversation sample
    return [
      {
        id: 'conv_sample_1',
        childId: 'ch_krisha',
        title: "Krisha didn't eat lunch today",
        category: 'Food',
        createdAt: Date.now() - 3600000 * 2,
        updatedAt: Date.now() - 3600000 * 2,
        messages: [
          {
            id: 'msg_1',
            conversationId: 'conv_sample_1',
            role: 'user',
            content: "She didn't eat lunch today and pushed the vegetable khichdi away.",
            timestamp: Date.now() - 3600000 * 2,
          },
          {
            id: 'msg_2',
            conversationId: 'conv_sample_1',
            role: 'assistant',
            content: "Here is what you can do right now to keep mealtime calm and low-pressure.",
            structuredData: {
              whatYouCanDoNow: [
                'Remove the plate without commenting or sighing: "All done for now."',
                'Offer water or a small sip of milk to stay hydrated.',
                'Plan a balanced afternoon snack in 2 hours (e.g. sliced banana with curd) rather than giving snacks immediately.',
              ],
              whyThisIsHappening: 'At 2 years, toddler appetite naturally fluctuates based on activity levels, teething, and seeking control over their body.',
              tryThis: [
                'Serve a "safe food" she already loves (like paneer or sweet potato) on the side of new foods.',
                'Let her use a child fork or dip food in yogurt.',
              ],
              watchFor: ['Proper hydration and energetic play during the afternoon.'],
              whenToSeekHelp: '',
              quickScript: 'Your body knows when it is full. We will eat again at snack time.',
              oneFollowUpQuestion: 'Has she been drinking extra milk before lunch today?',
            },
            timestamp: Date.now() - 3600000 * 2 + 1000,
          },
        ],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [savedActivities, setSavedActivities] = useState<ScreenFreeActivity[]>(() => {
    const saved = localStorage.getItem('parentpal_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('parentpal_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('parentpal_children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem('parentpal_active_child_id', activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    localStorage.setItem('parentpal_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('parentpal_activities', JSON.stringify(savedActivities));
  }, [savedActivities]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    showNotification('Parent profile updated');
  };

  const addChild = (childData: Omit<ChildProfile, 'id' | 'userId'>): string => {
    const newId = `ch_${Date.now()}`;
    const newChild: ChildProfile = {
      ...childData,
      id: newId,
      userId: user.id,
    };
    setChildrenList(prev => [...prev, newChild]);
    setActiveChildId(newId);
    showNotification(`Added ${newChild.name}'s profile`);
    return newId;
  };

  const updateChild = (id: string, updates: Partial<ChildProfile>) => {
    setChildrenList(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    showNotification('Child profile updated');
  };

  const deleteChild = (id: string) => {
    if (childrenList.length <= 1) {
      showNotification('Cannot delete your only child profile');
      return;
    }
    setChildrenList(prev => prev.filter(c => c.id !== id));
    if (activeChildId === id) {
      const next = childrenList.find(c => c.id !== id);
      if (next) setActiveChildId(next.id);
    }
    showNotification('Profile removed');
  };

  const createConversation = (title = 'New conversation', category: Conversation['category'] = 'General'): string => {
    const newId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      childId: activeChildId,
      title,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  };

  const addMessageToConversation = (
    conversationId: string,
    message: Omit<Message, 'id' | 'timestamp' | 'conversationId'>
  ) => {
    const newMsg: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      conversationId,
      timestamp: Date.now(),
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMsg];
          // Title auto-update if first user message
          let newTitle = conv.title;
          if (conv.messages.length === 0 && message.role === 'user') {
            newTitle = message.content.slice(0, 36) + (message.content.length > 36 ? '...' : '');
          }
          return {
            ...conv,
            title: newTitle,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        }
        return conv;
      })
    );

    // Profile memory update automation if AI detected a preference
    if (message.structuredData?.detectedProfileUpdate?.item) {
      const { type, item } = message.structuredData.detectedProfileUpdate;
      if (type === 'dislike') {
        const curChild = childrenList.find(c => c.id === activeChildId);
        if (curChild && !curChild.dislikes.includes(item)) {
          updateChild(curChild.id, { dislikes: [...curChild.dislikes, item] });
          showNotification(`Noted: ${curChild.name} dislikes ${item}`);
        }
      } else if (type === 'like') {
        const curChild = childrenList.find(c => c.id === activeChildId);
        if (curChild && !curChild.likes.includes(item)) {
          updateChild(curChild.id, { likes: [...curChild.likes, item] });
          showNotification(`Noted: ${curChild.name} likes ${item}`);
        }
      }
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
    showNotification('Conversation deleted');
  };

  const toggleFavoriteActivity = (activity: ScreenFreeActivity) => {
    setSavedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        return prev.map(a => (a.id === activity.id ? { ...a, isFavorite: !a.isFavorite } : a));
      } else {
        return [...prev, { ...activity, isFavorite: true }];
      }
    });
  };

  // Find active child or fallback
  const rawActiveChild = childrenList.find(c => c.id === activeChildId) || childrenList[0] || defaultChildren[0];
  const ageStats = calculateAge(rawActiveChild.dateOfBirth);

  const activeChild = {
    ...rawActiveChild,
    ageFormatted: ageStats.formatted,
    ageMonths: ageStats.totalMonths,
    ageYears: ageStats.years,
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        children: childrenList,
        activeChildId,
        activeChild,
        setActiveChildId,
        addChild,
        updateChild,
        deleteChild,
        conversations,
        activeConversationId,
        setActiveConversationId,
        createConversation,
        addMessageToConversation,
        deleteConversation,
        currentTab,
        setCurrentTab,
        isUrgentModalOpen,
        setIsUrgentModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        savedActivities,
        toggleFavoriteActivity,
        notification,
        showNotification,
      }}
    >
      {reactChildren}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
