/**
 * Paywall Modal - Upgrade to BASE/PRO/PREMIUM plans
 * Shown after week 1 of free trial
 *
 * Integrates with Stripe Checkout for secure payments
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Crown, Star, TrendingUp, Shield, Video, Loader2, CreditCard } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { redirectToCheckout, PlanTier } from '../lib/stripeClient';
import { supabase } from '../lib/supabaseClient';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan?: (tier: 'base' | 'pro' | 'premium') => void;
  userProgress?: {
    workoutsCompleted: number;
    baselineImprovements: string[];
    injuriesAvoided: number;
  };
}

export default function PaywallModal({ open, onClose, onSelectPlan, userProgress }: PaywallModalProps) {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<'base' | 'pro' | 'premium'>('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const plans = [
    {
      tier: 'base' as const,
      name: 'BASE',
      price: '19.90',
      monthlyEquivalent: '13.27',
      badge: null,
      icon: TrendingUp,
      color: 'from-gray-600 to-gray-700',
      borderColor: 'border-gray-600',
      features: [
        { text: t('paywall.feature.complete_program'), included: true },
        { text: t('paywall.feature.progressive_overload'), included: true },
        { text: t('paywall.feature.pain_management'), included: true },
        { text: t('paywall.feature.workout_logger'), included: true },
        { text: t('paywall.feature.deload_week'), included: true },
        { text: t('paywall.feature.video_corrections'), included: false, note: t('paywall.feature.videos_included').replace('{{count}}', '0') }
      ]
    },
    {
      tier: 'pro' as const,
      name: 'PRO',
      price: '29.90',
      monthlyEquivalent: '19.93',
      badge: t('paywall.most_chosen'),
      icon: Zap,
      color: 'from-blue-600 to-purple-600',
      borderColor: 'border-blue-500',
      features: [
        { text: t('paywall.feature.all_base'), included: true },
        { text: t('paywall.feature.12_videos'), included: true, highlight: true, note: t('paywall.feature.per_week').replace('{{count}}', '2') },
        { text: t('paywall.feature.technique_history'), included: true },
        { text: t('paywall.feature.hd_tutorials'), included: true },
        { text: t('paywall.feature.exercise_library'), included: true },
        { text: t('paywall.feature.pdf_export'), included: false }
      ]
    },
    {
      tier: 'premium' as const,
      name: 'PREMIUM',
      price: '44.90',
      monthlyEquivalent: '29.93',
      badge: t('paywall.maximum'),
      icon: Crown,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500',
      features: [
        { text: t('paywall.feature.all_pro'), included: true },
        { text: t('paywall.feature.unlimited_videos'), included: true, highlight: true },
        { text: t('paywall.feature.pdf_export'), included: true },
        { text: t('paywall.feature.priority_support'), included: true },
        { text: t('paywall.feature.early_access'), included: true }
      ]
    }
  ];

  const handleSelectPlan = async (tier: 'base' | 'pro' | 'premium') => {
    setError(null);
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(t('paywall.error.not_logged_in'));
        setIsLoading(false);
        return;
      }

      // Callback to parent component
      onSelectPlan?.(tier);

      // Redirect to Stripe Checkout
      await redirectToCheckout(tier, user.id, user.email || '');

      // Note: redirectToCheckout will navigate away from the page
      // so we don't need to handle success here
    } catch (err) {
      console.error('[PAYWALL] Payment error:', err);
      setError(err instanceof Error ? err.message : t('paywall.error.generic'));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-lg max-w-6xl w-full my-8 border border-gray-700 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-gray-700">
          <h2 className="text-4xl font-bold text-white mb-3">
            {t('paywall.congrats_title')}
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            {t('paywall.unlock_subtitle')}
          </p>

          {/* User Progress */}
          {userProgress && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-400">{userProgress.workoutsCompleted}</p>
                <p className="text-sm text-gray-400">{t('paywall.workouts_completed')}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-400">
                  {userProgress.baselineImprovements.length}
                </p>
                <p className="text-sm text-gray-400">{t('paywall.baseline_improvements')}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-400">{userProgress.injuriesAvoided}</p>
                <p className="text-sm text-gray-400">{t('paywall.injuries_avoided')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedTier === plan.tier;
              const isRecommended = plan.tier === 'pro';

              return (
                <motion.div
                  key={plan.tier}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTier(plan.tier)}
                  className={`
                    relative bg-gray-800 rounded-lg p-6 cursor-pointer
                    transition-all duration-200 border-2
                    ${isSelected ? plan.borderColor : 'border-gray-700'}
                    ${isRecommended ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}
                  `}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Icon & Name */}
                  <div className="text-center mb-4">
                    <div className={`bg-gradient-to-r ${plan.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-gray-400">€</span>
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{t('paywall.per_6_weeks')}</p>
                    <p className="text-gray-500 text-xs">
                      {t('paywall.monthly_equivalent').replace('{{price}}', plan.monthlyEquivalent)}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-2 text-sm ${
                          feature.included ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {feature.included ? (
                          <Check className={`w-5 h-5 flex-shrink-0 ${feature.highlight ? 'text-green-400' : 'text-gray-400'}`} />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                        <span>
                          {feature.text}
                          {feature.note && (
                            <span className="text-xs text-gray-500 ml-1">({feature.note})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.tier);
                    }}
                    disabled={isLoading}
                    className={`
                      w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2
                      ${isSelected
                        ? `bg-gradient-to-r ${plan.color} text-white`
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }
                      ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {isLoading && isSelected ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('paywall.processing')}
                      </>
                    ) : (
                      <>
                        {isSelected && <CreditCard className="w-5 h-5" />}
                        {isSelected ? t('paywall.pay_now') : t('paywall.select')}
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Payment Methods Info */}
          <div className="flex items-center justify-center gap-4 mb-6 text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              {t('paywall.accepts_cards')}
            </span>
            <span>•</span>
            <span>{t('paywall.secure_payment')}</span>
          </div>

          {/* Benefits Summary */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-white font-bold mb-4 text-center">
              {t('paywall.why_different')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">{t('paywall.benefit.pain_title')}</p>
                  <p className="text-sm text-gray-400">
                    {t('paywall.benefit.pain_desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">{t('paywall.benefit.progressive_title')}</p>
                  <p className="text-sm text-gray-400">
                    {t('paywall.benefit.progressive_desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Video className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">{t('paywall.benefit.ai_title')}</p>
                  <p className="text-sm text-gray-400">
                    {t('paywall.benefit.ai_desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-medium">{t('paywall.benefit.no_commitment_title')}</p>
                  <p className="text-sm text-gray-400">
                    {t('paywall.benefit.no_commitment_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h4 className="text-white font-bold mb-4 text-center">
              {t('paywall.comparison_title')}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-2"></th>
                    <th className="text-center text-gray-400 pb-2">{t('paywall.comparison.pdf_sheets')}</th>
                    <th className="text-center text-gray-400 pb-2">{t('paywall.comparison.generic_apps')}</th>
                    <th className="text-center text-blue-400 pb-2 font-bold">FitnessFlow PRO</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-3">{t('paywall.comparison.custom_weights')}</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">{t('paywall.comparison.auto_progression')}</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">{t('paywall.comparison.pain_management')}</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3">{t('paywall.comparison.video_correction')}</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400">✅ {t('paywall.comparison.12_videos')}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-bold">{t('paywall.comparison.price_6_weeks')}</td>
                    <td className="text-center">€0-15</td>
                    <td className="text-center">€40-60</td>
                    <td className="text-center text-blue-400 font-bold">€29.90</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Coach Check CTA */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 mb-6 border border-blue-500/30">
            <div className="text-center">
              <h4 className="text-white font-bold text-lg mb-2">
                {t('paywall.coach_title')}
              </h4>
              <p className="text-gray-300 text-sm mb-4">
                {t('paywall.coach_desc')}
              </p>
              <button
                onClick={() => {
                  // TODO: Integrate booking system
                  window.open('https://calendly.com/fitnessflow-coach', '_blank');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all inline-flex items-center gap-2"
              >
                {t('paywall.coach_button')}
              </button>
            </div>
          </div>

          {/* Guarantee */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              {t('paywall.guarantee')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('paywall.no_auto_renewal')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
