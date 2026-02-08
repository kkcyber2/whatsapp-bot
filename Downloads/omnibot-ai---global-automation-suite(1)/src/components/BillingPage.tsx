import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Users } from 'lucide-react';
import { PRICING_TIERS } from '../../constants';
import { StripeCheckoutButton } from './StripeCheckoutButton';

export const BillingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto pb-20 sm:pb-40"
    >
      {/* Header */}
      <div className="mb-12 sm:mb-16 lg:mb-20 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4 sm:mb-6">
          Pricing Plans
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          Choose the perfect plan to power your global business automation
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {PRICING_TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className={`relative rounded-[3rem] sm:rounded-[4rem] border-2 p-8 sm:p-12 shadow-lg hover:shadow-2xl transition-all ${
              index === 1 // Highlight Pro tier
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-600 ring-offset-4 dark:ring-offset-slate-950'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {/* Popular Badge */}
            {index === 1 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-block px-6 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-xl">
                  💎 Most Popular
                </span>
              </div>
            )}

            {/* Tier Name */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-3">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                  ${tier.price}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-500 dark:text-slate-400 uppercase">
                  / month
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 to-slate-200 dark:to-slate-700 mb-6 sm:mb-8" />

            {/* Stats Grid */}
            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platforms</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{tier.limitPlatforms}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversations</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{tier.limitConversations.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creative Assets</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{tier.limitCreative}</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {tier.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <StripeCheckoutButton
              priceId={`price_${tier.id}`}
              tierName={tier.name}
              price={tier.price}
            />
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 sm:mt-20 lg:mt-24 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-8 sm:mb-10 text-center">
          Implementation Notes
        </h2>

        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 sm:p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[2rem]"
          >
            <h3 className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-200 mb-3 uppercase tracking-tight">
              🔧 Backend Implementation Required
            </h3>
            <p className="text-sm sm:text-base text-blue-800 dark:text-blue-300 leading-relaxed">
              The checkout buttons are currently in demo mode. To complete the integration, create a backend endpoint (e.g., <code className="bg-blue-200/50 dark:bg-blue-800/50 px-1.5 py-0.5 rounded font-mono text-sm">/api/create-checkout-session</code>) that:
            </p>
            <ol className="mt-4 space-y-2 text-sm sm:text-base text-blue-800 dark:text-blue-300 list-decimal list-inside">
              <li>Receives the price ID from the frontend</li>
              <li>Creates a Stripe checkout session with your secret key</li>
              <li>Returns the session ID to the frontend</li>
              <li>Frontend calls <code className="bg-blue-200/50 dark:bg-blue-800/50 px-1.5 py-0.5 rounded font-mono">.redirectToCheckout(sessionId)</code></li>
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 sm:p-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-[2rem]"
          >
            <h3 className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-200 mb-3 uppercase tracking-tight">
              ⚙️ Environment Variables
            </h3>
            <p className="text-sm sm:text-base text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
              Add your Stripe publishable key to <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1.5 py-0.5 rounded font-mono">.env</code>:
            </p>
            <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl border border-amber-700/20">
              <code className="text-amber-100 font-mono text-xs sm:text-sm">
                VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
              </code>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-[2rem]"
          >
            <h3 className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-200 mb-3 uppercase tracking-tight">
              ✅ Webhooks for Subscription Management
            </h3>
            <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Configure Stripe webhooks to handle <code className="bg-emerald-200/50 dark:bg-emerald-800/50 px-1.5 py-0.5 rounded font-mono">customer.subscription.updated</code> and <code className="bg-emerald-200/50 dark:bg-emerald-800/50 px-1.5 py-0.5 rounded font-mono">customer.subscription.deleted</code> events to sync subscription status with your backend database.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 sm:p-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-[2rem]"
          >
            <h3 className="text-lg sm:text-xl font-black text-indigo-900 dark:text-indigo-200 mb-3 uppercase tracking-tight">
              📚 Component Reference
            </h3>
            <p className="text-sm sm:text-base text-indigo-800 dark:text-indigo-300 leading-relaxed mb-3">
              The <code className="bg-indigo-200/50 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded font-mono">StripeCheckoutButton</code> component in <code className="bg-indigo-200/50 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded font-mono">src/components/StripeCheckoutButton.tsx</code> handles:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-indigo-800 dark:text-indigo-300 list-disc list-inside">
              <li>Loading Stripe.js from CDN</li>
              <li>Validating publishable key from environment</li>
              <li>Mock checkout session (ready for production integration)</li>
              <li>Error handling and user feedback</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
