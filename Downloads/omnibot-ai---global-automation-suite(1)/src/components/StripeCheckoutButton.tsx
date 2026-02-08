import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripeCheckoutButtonProps {
  priceId: string;
  tierName: string;
  price: number;
}

export const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  priceId,
  tierName,
  price
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!publishableKey) {
        throw new Error('Stripe publishable key is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
      }

      const stripe = await loadStripe(publishableKey);
      
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      // MOCK: In production, call your backend to create a checkout session
      // Mock checkout session ID for demonstration
      const mockSessionId = `cs_test_${Date.now()}`;
      
      // In production, your backend would return a real session ID from Stripe
      // Example backend call:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId, tierName })
      // });
      // const session = await response.json();

      // Redirect to Stripe Checkout (in production with real session ID)
      console.log('📌 MOCK CHECKOUT:', {
        sessionId: mockSessionId,
        priceId,
        tierName,
        price,
        note: 'In production, create checkout session on backend and redirect to Stripe Checkout'
      });

      // For development, show a demo message
      alert(`✅ Checkout Demo for ${tierName} ($${price}/month)\n\nIn production:\n1. Backend creates Stripe checkout session\n2. redirectToCheckout() redirects to payment page\n3. User completes payment\n4. Webhook confirms subscription`);

      // Actual production code would be:
      // const result = await stripe.redirectToCheckout({ sessionId });
      // if (result.error) {
      //   setError(result.error.message || 'Checkout failed');
      // }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during checkout';
      setError(errorMessage);
      console.error('Stripe checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Upgrade to ${tierName}`
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">Checkout Error</p>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Development note */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-2">
          📌 Development Mode
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          In production, implement a backend endpoint that creates a real Stripe checkout session and calls <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1.5 py-0.5 rounded font-mono text-[10px]">stripe.redirectToCheckout()</code>
        </p>
      </div>
    </div>
  );
};
