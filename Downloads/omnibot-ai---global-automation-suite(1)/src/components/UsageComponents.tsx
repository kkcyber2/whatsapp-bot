import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingTier } from '../../types';

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeExceeded: 'conversation' | 'creative';
  currentLimit: number;
  nextTierName?: string;
  nextTierLimit?: number;
}

export const UpgradeLimitModal: React.FC<UpgradeLimitModalProps> = ({
  isOpen,
  onClose,
  typeExceeded,
  currentLimit,
  nextTierName,
  nextTierLimit,
}) => {
  const typeLabel = typeExceeded === 'conversation' ? 'Conversations' : 'Creative Assets';
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl max-w-md w-full p-12"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-full mx-auto mb-6">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-3">
              Limit Reached
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
              You've reached your monthly limit of <span className="font-bold">{currentLimit} {typeLabel}</span> on your current plan.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Current Limits
                </p>
                <p className="text-sm text-slate-900 dark:text-white font-bold">
                  {currentLimit} {typeLabel} / Month
                </p>
              </div>

              {nextTierLimit && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Upgrade to {nextTierName}
                  </p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 font-bold">
                    {nextTierLimit} {typeLabel} / Month
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Continue Free
              </button>
              <button
                onClick={() => {
                  // Navigate to billing page
                  window.location.href = '/billing';
                }}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all"
              >
                Upgrade Plan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface UsageBarProps {
  type: 'conversation' | 'creative';
  tier: PricingTier;
  currentUsage: number;
  showLabel?: boolean;
  compact?: boolean;
}

export const UsageBar: React.FC<UsageBarProps> = ({
  type,
  tier,
  currentUsage,
  showLabel = true,
  compact = false,
}) => {
  const limit = type === 'conversation' ? tier.limitConversations : tier.limitCreative;
  const percentage = Math.min(100, (currentUsage / limit) * 100);
  const remaining = Math.max(0, limit - currentUsage);

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600 dark:text-emerald-400';

  if (percentage > 75) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-600 dark:text-amber-400';
  }
  if (percentage > 90) {
    barColor = 'bg-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
  }

  const typeLabel = type === 'conversation' ? 'Conversations' : 'Creative Assets';

  if (compact) {
    return (
      <div className="space-y-1.5">
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {typeLabel}
            </span>
            <span className={`text-[10px] font-black ${textColor}`}>
              {currentUsage} / {limit}
            </span>
          </div>
        )}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full ${barColor} transition-colors`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-black text-slate-900 dark:text-white">
            {typeLabel}
          </span>
          <span className={`text-sm font-bold ${textColor}`}>
            {currentUsage} / {limit} ({remaining} remaining)
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full ${barColor} transition-colors`}
        />
      </div>
    </div>
  );
};

interface UsageHeaderWidgetProps {
  tier: PricingTier;
  currentUsage: { conversations: number; creative: number };
}

export const UsageHeaderWidget: React.FC<UsageHeaderWidgetProps> = ({ tier, currentUsage }) => {
  const conversationPercentage = Math.min(100, (currentUsage.conversations / tier.limitConversations) * 100);
  const creativePercentage = Math.min(100, (currentUsage.creative / tier.limitCreative) * 100);

  const isCritical = conversationPercentage > 90 || creativePercentage > 90;

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
      <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
        Monthly Usage
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-bold">Conversations</span>
          <span className={`font-black ${
            conversationPercentage > 90 
              ? 'text-rose-600 dark:text-rose-400' 
              : conversationPercentage > 75 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {currentUsage.conversations}/{tier.limitConversations}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${conversationPercentage}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full ${
              conversationPercentage > 90
                ? 'bg-rose-500'
                : conversationPercentage > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-bold">Creative Assets</span>
          <span className={`font-black ${
            creativePercentage > 90 
              ? 'text-rose-600 dark:text-rose-400' 
              : creativePercentage > 75 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {currentUsage.creative}/{tier.limitCreative}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${creativePercentage}%` }}
            transition={{ duration: 0.6 }}
            className={`h-full ${
              creativePercentage > 90
                ? 'bg-rose-500'
                : creativePercentage > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>

      {isCritical && (
        <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-800">
          <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">
            ⚠️ Nearing limit
          </p>
        </div>
      )}
    </div>
  );
};

// Toast notification component for usage alerts
export const UsageToast: React.FC<{
  isVisible: boolean;
  type: 'success' | 'warning' | 'error';
  message: string;
}> = ({ isVisible, type, message }) => {
  const bgColor = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800',
    error: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800',
  };

  const textColor = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-3 rounded-lg border ${bgColor[type]} text-sm font-bold ${textColor[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
