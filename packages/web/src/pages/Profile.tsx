import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Settings, LogOut, ChevronRight, Shield, Bell, Globe, Moon, HelpCircle, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DeleteAccountModal from '../components/DeleteAccountModal';

interface UserData {
  email: string;
  name?: string;
  created_at?: string;
  subscription_tier?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get user profile from database
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserData({
          email: user.email || '',
          name: profile?.full_name || user.user_metadata?.full_name,
          created_at: user.created_at,
          subscription_tier: profile?.subscription_tier || 'free'
        });
      }

      // Load onboarding data
      const onboarding = localStorage.getItem('onboarding_data');
      if (onboarding) {
        setOnboardingData(JSON.parse(onboarding));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const menuItems = [
    {
      icon: User,
      label: 'Dati Personali',
      description: 'Modifica peso, altezza, obiettivi',
      onClick: () => navigate('/onboarding'),
      color: 'text-blue-400'
    },
    {
      icon: Bell,
      label: 'Notifiche',
      description: 'Gestisci promemoria workout',
      onClick: () => {},
      color: 'text-purple-400'
    },
    {
      icon: Globe,
      label: 'Lingua',
      description: 'Cambia lingua app',
      onClick: () => {},
      color: 'text-emerald-400',
      rightContent: <LanguageSwitcher />
    },
    {
      icon: Shield,
      label: 'Privacy',
      description: 'Gestisci i tuoi dati',
      onClick: () => navigate('/privacy-policy'),
      color: 'text-amber-400'
    },
    {
      icon: HelpCircle,
      label: 'Aiuto',
      description: 'FAQ e supporto',
      onClick: () => {},
      color: 'text-cyan-400'
    },
    {
      icon: FileText,
      label: 'Termini di Servizio',
      description: 'Leggi i termini',
      onClick: () => navigate('/terms-of-service'),
      color: 'text-slate-400'
    },
    {
      icon: Trash2,
      label: 'Elimina Account',
      description: 'Cancella tutti i tuoi dati',
      onClick: () => setShowDeleteModal(true),
      color: 'text-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {userData?.name?.charAt(0) || userData?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-display font-bold">
                    {userData?.name || 'Utente'}
                  </h2>
                  <p className="text-sm text-slate-400 truncate">
                    {userData?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      userData?.subscription_tier === 'premium'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : userData?.subscription_tier === 'pro'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {userData?.subscription_tier?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {onboardingData && (
                <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-emerald-400">
                      {onboardingData.personalInfo?.weight || '-'}
                    </p>
                    <p className="text-xs text-slate-400">Peso (kg)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-blue-400">
                      {onboardingData.personalInfo?.height || '-'}
                    </p>
                    <p className="text-xs text-slate-400">Altezza (cm)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-purple-400">
                      {onboardingData.activityLevel?.weeklyFrequency || '-'}x
                    </p>
                    <p className="text-xs text-slate-400">Sett.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={item.onClick}
              className="w-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 transition-all duration-200"
            >
              <div className={`p-2 rounded-lg bg-slate-700/50 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
              {item.rightContent || <ChevronRight className="w-5 h-5 text-slate-500" />}
            </motion.button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full mt-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Esci</span>
        </motion.button>

        {/* App Version */}
        <p className="text-center text-xs text-slate-500 mt-6">
          TrainSmart v1.0.0
        </p>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={userData?.email || ''}
        onSuccess={() => {
          navigate('/login');
        }}
      />
    </div>
  );
}
