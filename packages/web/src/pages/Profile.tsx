import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Settings, LogOut, ChevronRight, Shield, Bell, Globe, Sun, HelpCircle, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import DeleteAccountModal from '../components/DeleteAccountModal';
import BetaTesterPanel from '../components/BetaTesterPanel';

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
      label: t('profile.personal_data') || 'Dati Personali',
      description: t('profile.personal_data_desc') || 'Modifica peso, altezza, obiettivi',
      onClick: () => navigate('/onboarding'),
      color: 'text-info'
    },
    {
      icon: Bell,
      label: t('profile.notifications') || 'Notifiche',
      description: t('profile.notifications_desc') || 'Gestisci promemoria workout',
      onClick: () => {},
      color: 'text-accent'
    },
    {
      icon: Globe,
      label: t('profile.language') || 'Lingua',
      description: t('profile.language_desc') || 'Cambia lingua app',
      onClick: () => {},
      color: 'text-primary',
      rightContent: <LanguageSwitcher />
    },
    {
      icon: Sun,
      label: t('theme.label') || 'Tema',
      description: t('profile.theme_desc') || 'Chiaro, scuro o automatico',
      onClick: () => {},
      color: 'text-warning',
      rightContent: <ThemeToggle showSystemOption />
    },
    {
      icon: Shield,
      label: t('profile.privacy') || 'Privacy',
      description: t('profile.privacy_desc') || 'Gestisci i tuoi dati',
      onClick: () => navigate('/privacy-policy'),
      color: 'text-warning'
    },
    {
      icon: HelpCircle,
      label: t('profile.help') || 'Aiuto',
      description: t('profile.help_desc') || 'FAQ e supporto',
      onClick: () => {},
      color: 'text-info'
    },
    {
      icon: FileText,
      label: t('profile.terms') || 'Termini di Servizio',
      description: t('profile.terms_desc') || 'Leggi i termini',
      onClick: () => navigate('/terms-of-service'),
      color: 'text-muted-foreground'
    },
    {
      icon: Trash2,
      label: t('profile.delete_account') || 'Elimina Account',
      description: t('profile.delete_account_desc') || 'Cancella tutti i tuoi dati',
      onClick: () => setShowDeleteModal(true),
      color: 'text-destructive'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary-foreground">
                    {userData?.name?.charAt(0) || userData?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-display font-bold">
                    {userData?.name || 'Utente'}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {userData?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      userData?.subscription_tier === 'premium'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : userData?.subscription_tier === 'pro'
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {userData?.subscription_tier?.toUpperCase() || 'FREE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {onboardingData && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-primary">
                      {onboardingData.personalInfo?.weight || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Peso (kg)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-info">
                      {onboardingData.personalInfo?.height || '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Altezza (cm)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl font-bold text-accent">
                      {onboardingData.activityLevel?.weeklyFrequency || '-'}x
                    </p>
                    <p className="text-xs text-muted-foreground">Sett.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Beta Tester Panel */}
        <div className="mb-6">
          <BetaTesterPanel />
        </div>

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
              className="w-full bg-card hover:bg-muted border border-border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 touch-target focus-visible-ring"
            >
              <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {item.rightContent || <ChevronRight className="w-5 h-5 text-muted-foreground" aria-hidden="true" />}
            </motion.button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleLogout}
          className="w-full mt-6 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-200 touch-target focus-visible-ring"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">{t('nav.logout') || 'Esci'}</span>
        </motion.button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
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
