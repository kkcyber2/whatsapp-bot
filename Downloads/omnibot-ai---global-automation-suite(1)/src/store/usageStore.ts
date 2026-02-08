import { create } from 'zustand';
import { PricingTier } from '../../types';

export interface UsageData {
  conversations: number;
  creative: number;
  lastReset: string; // ISO date string
}

interface UsageStore {
  currentUsage: UsageData;
  
  // Increment usage after successful generation
  increment: (type: 'conversation' | 'creative') => void;
  
  // Reset usage at monthly interval
  resetMonthly: () => void;
  
  // Check if usage is within tier limits
  isWithinLimits: (tier: PricingTier) => boolean;
  
  // Get remaining quota for a specific type
  getRemaining: (type: 'conversation' | 'creative', tier: PricingTier) => number;
  
  // Get usage percentage (for progress bars)
  getUsagePercentage: (type: 'conversation' | 'creative', tier: PricingTier) => number;
  
  // Load from localStorage
  loadFromStorage: () => void;
  
  // Save to localStorage
  saveToStorage: () => void;
}

const STORAGE_KEY = 'omnibot_usage_data';
const USAGE_RESET_DATE_KEY = 'omnibot_usage_reset_date';

// Get the first day of current month
const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

// Check if monthly reset is needed
const shouldResetMonthly = (lastReset: string): boolean => {
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  
  return (
    lastResetDate.getFullYear() !== now.getFullYear() ||
    lastResetDate.getMonth() !== now.getMonth()
  );
};

const getInitialUsage = (): UsageData => {
  return {
    conversations: 0,
    creative: 0,
    lastReset: getFirstDayOfMonth(),
  };
};

export const useUsageStore = create<UsageStore>((set, get) => ({
  currentUsage: getInitialUsage(),

  increment: (type: 'conversation' | 'creative') => {
    const store = get();
    
    // Check if monthly reset is needed
    if (shouldResetMonthly(store.currentUsage.lastReset)) {
      store.resetMonthly();
      return;
    }

    set((state) => ({
      currentUsage: {
        ...state.currentUsage,
        [type === 'conversation' ? 'conversations' : 'creative']:
          type === 'conversation'
            ? state.currentUsage.conversations + 1
            : state.currentUsage.creative + 1,
      },
    }));

    // Auto-save to localStorage
    get().saveToStorage();
  },

  resetMonthly: () => {
    const newUsage = getInitialUsage();
    set({ currentUsage: newUsage });
    get().saveToStorage();
    console.log('[UsageStore] Monthly usage reset');
  },

  isWithinLimits: (tier: PricingTier) => {
    const store = get();
    const usage = store.currentUsage;

    const conversationsOk = usage.conversations < tier.limitConversations;
    const creativeOk = usage.creative < tier.limitCreative;

    return conversationsOk && creativeOk;
  },

  getRemaining: (type: 'conversation' | 'creative', tier: PricingTier) => {
    const store = get();
    const usage = store.currentUsage;

    if (type === 'conversation') {
      return Math.max(0, tier.limitConversations - usage.conversations);
    } else {
      return Math.max(0, tier.limitCreative - usage.creative);
    }
  },

  getUsagePercentage: (type: 'conversation' | 'creative', tier: PricingTier) => {
    const store = get();
    const usage = store.currentUsage;

    const limit = type === 'conversation' ? tier.limitConversations : tier.limitCreative;
    const current = type === 'conversation' ? usage.conversations : usage.creative;

    if (limit === 0) return 0;
    return Math.min(100, (current / limit) * 100);
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const usage = JSON.parse(stored) as UsageData;
        
        // Check if monthly reset is needed
        if (shouldResetMonthly(usage.lastReset)) {
          set({ currentUsage: getInitialUsage() });
        } else {
          set({ currentUsage: usage });
        }
      }
    } catch (error) {
      console.error('[UsageStore] Failed to load from localStorage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const store = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.currentUsage));
    } catch (error) {
      console.error('[UsageStore] Failed to save to localStorage:', error);
    }
  },
}));

// Initialize store from localStorage on app start
useUsageStore.getState().loadFromStorage();
