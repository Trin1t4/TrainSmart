/**
 * Payment Success Page
 *
 * Shown after successful Stripe checkout
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getSubscriptionStatus } from '../lib/stripeClient';
import { supabase } from '../lib/supabaseClient';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check subscription status (webhook should have processed by now)
          const status = await getSubscriptionStatus(user.id);

          if (status?.isActive) {
            setSubscriptionTier(status.tier);
          }
        }
      } catch (error) {
        console.error('[PAYMENT] Error verifying:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    // Small delay to allow webhook to process
    const timer = setTimeout(verifyPayment, 2000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-slate-700 text-center"
      >
        {isVerifying ? (
          <>
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('payment_success.verifying')}
            </h1>
            <p className="text-slate-400">
              {t('payment_success.please_wait')}
            </p>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('payment_success.title')}
              </h1>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-emerald-400 font-semibold text-lg">
                  {subscriptionTier
                    ? t('payment_success.plan_activated').replace('{{plan}}', subscriptionTier.toUpperCase())
                    : t('payment_success.subscription_active')}
                </span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>

              <p className="text-slate-300 mb-8">
                {t('payment_success.ready_message')}
              </p>

              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">
                  {t('payment_success.whats_next')}
                </h3>
                <ul className="text-sm text-slate-300 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {t('payment_success.next_1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {t('payment_success.next_2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {t('payment_success.next_3')}
                  </li>
                </ul>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {t('payment_success.go_to_dashboard')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
