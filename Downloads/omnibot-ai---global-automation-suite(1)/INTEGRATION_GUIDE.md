/**
 * USAGE TRACKING INTEGRATION GUIDE
 * 
 * This file shows integration points for the usage tracking system.
 * Copy the relevant code snippets into your components.
 */

// ============================================================================
// 1. IN geminiService.ts - After successful generation
// ============================================================================

/*
LOCATION: src/geminiService.ts

In the OmniAIService class, after each successful API call, add increment call:

EXAMPLE 1: After generateAgentResponse (conversation)
---
export class OmniAIService {
  static async generateAgentResponse(...) {
    try {
      const response = await fetch('http://localhost:3001/api/gemini', {
        // ... existing code
      });
      
      const data = await response.json();
      
      // ✅ ADD THIS:
      if (data.text) {
        useUsageStore.getState().increment('conversation');
      }
      
      return data;
    } catch (error) {
      // ... error handling
    }
  }

EXAMPLE 2: After generateImage (creative)
---
  static async generateImage(prompt: string) {
    try {
      const response = await fetch('http://localhost:3001/api/gemini', {
        // ... existing code
      });
      
      const data = await response.json();
      
      // ✅ ADD THIS:
      if (data.image) {
        useUsageStore.getState().increment('creative');
      }
      
      return data;
    } catch (error) {
      // ... error handling
    }
  }

NEEDED IMPORTS:
import { useUsageStore } from './src/store/usageStore';
*/

// ============================================================================
// 2. IN UnifiedInbox (chats) - Before calling generateAgentResponse
// ============================================================================

/*
LOCATION: App.tsx - UnifiedInbox component

Before sending a message, check if user is within limits:

---
const UnifiedInbox = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // ✅ ADD THESE:
  const { currentUsage, isWithinLimits } = useUsageStore();
  const userTier = PRICING_TIERS[1]; // Get from actual user data

  const sendMessage = async () => {
    if (!input.trim()) return;

    // ✅ CHECK LIMITS BEFORE CALLING AI:
    if (!isWithinLimits(userTier)) {
      setShowUpgradeModal(true);
      return;
    }

    const msg: Message = {
      id: Math.random().toString(),
      senderId: 'me',
      senderName: 'You',
      platform: selectedCustomer.lastPlatform,
      content: input,
      timestamp: new Date(),
      sentiment: Sentiment.NEUTRAL,
      isAiResponse: false
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setIsTyping(true);

    try {
      // Original code - usage will be incremented automatically
      const response = await OmniAIService.generateAgentResponse(
        input, 
        selectedCustomer.name, 
        selectedCustomer.lastPlatform
      );
      
      const aiMsg: Message = {
        // ... existing code
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div>
      {/* Existing JSX */}
      
      {/* ✅ ADD UPGRADE MODAL: */}
      <UpgradeLimitModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        typeExceeded="conversation"
        currentLimit={userTier.limitConversations}
        nextTierName="Pro Elite"
        nextTierLimit={5000}
      />
    </div>
  );
};

NEEDED IMPORTS:
import { useUsageStore } from './src/store/usageStore';
import { UpgradeLimitModal } from './src/components/UsageComponents';
import { PRICING_TIERS } from './constants';
*/

// ============================================================================
// 3. IN MainLayout (Header) - Show usage in top bar
// ============================================================================

/*
LOCATION: App.tsx - MainLayout component

Add usage widget to the header:

---
const MainLayout = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  
  // ✅ ADD THIS:
  const { currentUsage } = useUsageStore();
  const userTier = PRICING_TIERS[1]; // Get from actual user data
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <header className="h-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-10 flex items-center justify-between">
          {/* ... existing header content ... */}
          
          {/* ✅ ADD USAGE WIDGET: */}
          <div className="hidden xl:block">
            <UsageHeaderWidget tier={userTier} currentUsage={currentUsage} />
          </div>
          
          {/* ... rest of header ... */}
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

NEEDED IMPORTS:
import { useUsageStore } from './src/store/usageStore';
import { UsageHeaderWidget } from './src/components/UsageComponents';
import { PRICING_TIERS } from './constants';
*/

// ============================================================================
// 4. IN CreativeStudio (Asset Lab) - Before image generation
// ============================================================================

/*
LOCATION: App.tsx - CreativeStudio component (when created)

Template for checking limits before creative generation:

---
const CreativeStudio = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // ✅ ADD THESE:
  const { currentUsage, isWithinLimits, getRemaining } = useUsageStore();
  const userTier = PRICING_TIERS[1]; // Get from actual user data

  const generateImage = async (prompt: string) => {
    // ✅ CHECK LIMITS:
    if (!isWithinLimits(userTier)) {
      const remaining = getRemaining('creative', userTier);
      setToastMessage(`No creative assets remaining. Upgrade to generate more.`);
      setToastVisible(true);
      setShowUpgradeModal(true);
      return;
    }

    try {
      const image = await OmniAIService.generateImage(prompt);
      // Usage will be incremented automatically
      
      // Show success
      setToastMessage('Image generated! 🎨');
      setToastVisible(true);
    } catch (error) {
      setToastMessage('Failed to generate image');
      setToastVisible(true);
    }
  };

  return (
    <div>
      {/* Your creative studio UI */}
      
      {/* ✅ ADD MODAL AND TOAST: */}
      <UpgradeLimitModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        typeExceeded="creative"
        currentLimit={userTier.limitCreative}
        nextTierName="Pro Elite"
        nextTierLimit={50}
      />
      
      <UsageToast
        isVisible={toastVisible}
        type={toastMessage.includes('success') ? 'success' : 'error'}
        message={toastMessage}
      />
    </div>
  );
};

NEEDED IMPORTS:
import { useUsageStore } from './src/store/usageStore';
import { UpgradeLimitModal, UsageToast } from './src/components/UsageComponents';
import { PRICING_TIERS } from './constants';
*/

// ============================================================================
// 5. IN DashboardView - Show usage stats
// ============================================================================

/*
LOCATION: App.tsx - DashboardView component

Display usage as stat cards:

---
const DashboardView = () => {
  // ✅ ADD THIS:
  const { currentUsage } = useUsageStore();
  const userTier = PRICING_TIERS[1]; // Get from actual user data
  const conversationPercentage = (currentUsage.conversations / userTier.limitConversations) * 100;
  const creativePercentage = (currentUsage.creative / userTier.limitCreative) * 100;
  
  return (
    <div className="p-10">
      {/* ... existing dashboard content ... */}
      
      {/* ✅ ADD USAGE SECTION: */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Conversation Usage</h4>
          <UsageBar 
            type="conversation" 
            tier={userTier}
            currentUsage={currentUsage.conversations}
          />
        </div>
        
        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
          <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Creative Usage</h4>
          <UsageBar 
            type="creative" 
            tier={userTier}
            currentUsage={currentUsage.creative}
          />
        </div>
      </div>
    </div>
  );
};

NEEDED IMPORTS:
import { useUsageStore } from './src/store/usageStore';
import { UsageBar } from './src/components/UsageComponents';
import { PRICING_TIERS } from './constants';
*/

// ============================================================================
// 6. TESTING THE USAGE SYSTEM
// ============================================================================

/*
In browser DevTools console, test the store:

// Get current usage
const store = document.querySelector("[data-test]").__react_internal; // Won't work, use this instead:
import { useUsageStore } from './src/store/usageStore';
const state = useUsageStore.getState();
console.log(state.currentUsage);

// Increment usage
state.increment('conversation');
state.increment('creative');

// Check limits
const tier = { limitConversations: 1000, limitCreative: 10 };
console.log(state.isWithinLimits(tier));

// Get remaining
console.log(state.getRemaining('conversation', tier));

// Reset monthly
state.resetMonthly();

// Check localStorage
console.log(localStorage.getItem('omnibot_usage_data'));
*/

// ============================================================================
// 7. GETTING USER TIER (REAL IMPLEMENTATION)
// ============================================================================

/*
When you have real user data from Supabase/auth, get their tier:

const GetUserTier = async (user: User): Promise<PricingTier> => {
  // Option 1: From user profile in Supabase
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single();
  
  const tierId = profile?.tier || 'starter';
  return PRICING_TIERS.find(t => t.id === tierId) || PRICING_TIERS[0];
};

Then in your components:
const [userTier, setUserTier] = useState<PricingTier | null>(null);

useEffect(() => {
  if (user) {
    GetUserTier(user).then(setUserTier);
  }
}, [user]);

if (!userTier) return <Loading />;
*/

// ============================================================================
// 8. SUMMARY OF FILES TO MODIFY
// ============================================================================

/*
Files to modify:

1. ✅ src/geminiService.ts
   - Import useUsageStore
   - Call increment() after successful API responses

2. ✅ App.tsx (UnifiedInbox)
   - Check isWithinLimits before calling AI
   - Show UpgradeLimitModal if limit reached

3. ✅ App.tsx (MainLayout header)
   - Import UsageHeaderWidget
   - Display current usage stats

4. ✅ App.tsx (DashboardView)
   - Import UsageBar
   - Show usage progress bars

5. ✅ App.tsx (CreativeStudio - when created)
   - Check isWithinLimits before image generation
   - Show toast notifications for usage

6. (Optional) Create page for /billing usage dashboard
   - Show detailed usage breakdown
   - Show available plans and upgrades

Files created:
- src/store/usageStore.ts (Zustand store)
- src/components/UsageComponents.tsx (UI components)
- INTEGRATION_GUIDE.md (this file)
*/

export {};
