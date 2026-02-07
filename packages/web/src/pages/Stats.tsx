import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, TrendingUp, Calendar, Award, BarChart3, Trophy, Database, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { useCurrentProgram } from '../hooks/useProgram';
import { supabase } from '../lib/supabaseClient';
import ProgressCharts from '../components/ProgressCharts';
import PainProgressChart from '../components/PainProgressChart';
import StrengthProgressChart from '../components/StrengthProgressChart';
import AllTimePersonalRecords from '../components/AllTimePersonalRecords';
import ScientificProgressPanel from '../components/ScientificProgressPanel';

type TabType = 'overview' | 'pain' | 'progress' | 'history' | 'records';

const TABS: { id: TabType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'overview', label: 'Panoramica', icon: BarChart3, color: 'text-slate-400' },
  { id: 'pain', label: 'Dolore', icon: AlertCircle, color: 'text-amber-400' },
  { id: 'progress', label: 'Forza & Volume', icon: TrendingUp, color: 'text-blue-400' },
  { id: 'history', label: 'Storico', icon: Database, color: 'text-purple-400' },
  { id: 'records', label: 'RM', icon: Trophy, color: 'text-amber-400' },
];

export default function Stats() {
  const { t } = useTranslation();
  const { data: program } = useCurrentProgram();
  const [screeningData, setScreeningData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [userWeight, setUserWeight] = useState<number>(75);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (TABS.some(tab => tab.id === hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab('overview');
      }
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  };

  useEffect(() => {
    const data = localStorage.getItem('screening_data');
    if (data) {
      setScreeningData(JSON.parse(data));
    }
  }, []);

  // Get user ID
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        // Try to get user weight from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('weight')
          .eq('id', user.id)
          .single();

        if (profile?.weight) {
          setUserWeight(profile.weight);
        }
      }
    };
    getUser();
  }, []);

  // Calculate stats
  const stats = {
    totalWorkouts: program?.weekly_split?.days?.length || 0,
    currentStreak: 0, // TODO: Calculate from workout logs
    weeklyVolume: 0,
    progressPercent: 0,
  };

  if (program?.weekly_split?.days) {
    program.weekly_split.days.forEach((day: any) => {
      day.exercises?.forEach((ex: any) => {
        if (ex.sets && ex.reps) {
          const reps = typeof ex.reps === 'string' ? parseInt(ex.reps.split('-')[0]) : ex.reps;
          stats.weeklyVolume += ex.sets * reps;
        }
      });
    });
  }

  const renderTabContent = () => {
    if (!userId) {
      return (
        <div className="text-center py-12 text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Caricamento...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'pain':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PainProgressChart userId={userId} className="mb-4" />
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StrengthProgressChart userId={userId} className="mb-4" />
          </motion.div>
        );

      case 'history':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScientificProgressPanel
              userId={userId}
              userWeight={userWeight}
              className="mb-4"
            />
          </motion.div>
        );

      case 'records':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AllTimePersonalRecords userId={userId} className="mb-4" />
          </motion.div>
        );

      case 'overview':
      default:
        return (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-300/60">Workout/Sett</p>
                        <p className="text-xl md:text-2xl font-bold text-emerald-400">
                          {stats.totalWorkouts}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-300/60">Volume Sett</p>
                        <p className="text-xl md:text-2xl font-bold text-blue-400">
                          {stats.weeklyVolume.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-300/60">Streak</p>
                        <p className="text-xl md:text-2xl font-bold text-purple-400">
                          {stats.currentStreak} giorni
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-300/60">Livello</p>
                        <p className="text-xl md:text-2xl font-bold text-amber-400">
                          {screeningData?.level?.toUpperCase() || '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-800/60 border-slate-700/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-display flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Progressi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  {program ? (
                    <ProgressCharts />
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Genera un programma per vedere i progressi</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Baseline Comparison */}
            {screeningData?.patternBaselines && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4"
              >
                <Card className="bg-slate-800/60 border-slate-700/50">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl font-display">
                      Baseline per Pattern
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-3">
                      {Object.entries(screeningData.patternBaselines).map(([pattern, data]: [string, any]) => (
                        <div key={pattern} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-200">
                              {data.variantName || pattern}
                            </p>
                            <p className="text-xs text-slate-400">
                              {pattern.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-400">
                              {data.reps} reps
                            </p>
                            <p className="text-xs text-slate-400">
                              Difficoltà: {data.difficulty}/10
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-4xl font-display font-bold mb-2">
            Statistiche
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Monitora i tuoi progressi
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1.5 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 whitespace-nowrap flex-shrink-0
                    ${isActive
                      ? 'bg-slate-700 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? tab.color : ''}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
