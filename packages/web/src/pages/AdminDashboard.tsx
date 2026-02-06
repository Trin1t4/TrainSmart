/**
 * ADMIN DASHBOARD - Analytics & Monitoring
 *
 * Dashboard completa per amministratori con:
 * - Metriche business (registrazioni, conversioni, churn)
 * - Grafici trend temporali
 * - Lista utenti recenti
 * - Program popularity
 * - RPE trends
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  isAdmin as checkIsAdmin,
  getAdminDashboardData,
  getUserInsightsData,
  type AdminDashboardData,
  type UserInsightsData,
} from '@trainsmart/shared';
import { supabase } from '../lib/supabaseClient';
import { RefreshCw, AlertTriangle, X, Trash2, Users, Clock, MousePointerClick } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [insightsData, setInsightsData] = useState<UserInsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset modal state
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    isResetting: boolean;
  }>({ isOpen: false, userId: '', userEmail: '', isResetting: false });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  // Reset user program function
  async function resetUserProgram(userId: string) {
    setResetModal(prev => ({ ...prev, isResetting: true }));

    try {
      // 1. Delete all training programs for this user
      const { error: programError } = await supabase
        .from('training_programs')
        .delete()
        .eq('user_id', userId);

      if (programError) {
        console.error('[AdminDashboard] Error deleting programs:', programError);
        throw programError;
      }

      // 2. Reset onboarding_completed flag in user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('[AdminDashboard] Error updating profile:', profileError);
        // Non-blocking: profile update is optional
      }

      console.log(`[AdminDashboard] ✅ Program reset for user ${userId}`);

      // Close modal and refresh data
      setResetModal({ isOpen: false, userId: '', userEmail: '', isResetting: false });

      // Refresh dashboard data
      await checkAdminAndLoadData();

    } catch (err: any) {
      console.error('[AdminDashboard] Reset error:', err);
      alert('Errore durante il reset: ' + (err.message || 'Errore sconosciuto'));
      setResetModal(prev => ({ ...prev, isResetting: false }));
    }
  }

  async function checkAdminAndLoadData() {
    try {
      setLoading(true);
      setError(null);

      // Check if user is admin
      const { data: adminStatus, error: adminError } = await checkIsAdmin();

      if (adminError) {
        throw new Error('Errore verifica admin: ' + adminError.message);
      }

      if (!adminStatus) {
        setError('Accesso negato: Non hai i permessi di amministratore');
        setLoading(false);
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      setIsAdmin(true);

      // Load dashboard data + user insights in parallel
      const [dashResult, insightsResult] = await Promise.all([
        getAdminDashboardData(),
        getUserInsightsData(),
      ]);

      if (dashResult.error) {
        throw new Error('Errore caricamento dati: ' + dashResult.error.message);
      }

      setDashboardData(dashResult.data);
      // Insights are optional — don't fail if they error
      if (insightsResult.data) {
        setInsightsData(insightsResult.data);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('[AdminDashboard] Error:', err);
      setError(err.message || 'Errore caricamento dashboard');
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Caricamento dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⛔ Accesso Negato</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-gray-500 text-sm mt-4">Redirect to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Nessun dato disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🎛️ Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">TrainSmart Analytics & Monitoring</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            ← Torna alla Dashboard
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Totale Utenti"
            value={dashboardData.totalUsers}
            icon="👥"
            color="blue"
          />
          <KPICard
            title="Utenti Attivi"
            value={dashboardData.activeUsers}
            subtitle={`${Math.round((dashboardData.activeUsers / dashboardData.totalUsers) * 100)}% del totale`}
            icon="✅"
            color="green"
          />
          <KPICard
            title="Programmi Creati"
            value={dashboardData.totalPrograms}
            icon="📋"
            color="purple"
          />
          <KPICard
            title="Workout Loggati"
            value={dashboardData.totalWorkouts}
            icon="💪"
            color="orange"
          />
        </div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">🔄 Conversion Funnel</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ConversionCard
              title="Registration → Onboarding"
              rate={dashboardData.conversionRates.registrationToOnboarding}
            />
            <ConversionCard
              title="Onboarding → Screening"
              rate={dashboardData.conversionRates.onboardingToScreening}
            />
            <ConversionCard
              title="Screening → Program"
              rate={dashboardData.conversionRates.screeningToProgram}
            />
            <ConversionCard
              title="Program → Workout"
              rate={dashboardData.conversionRates.programToWorkout}
            />
          </div>
        </motion.div>

        {/* ============ USER INSIGHTS SECTION ============ */}
        {insightsData && (
          <UserInsightsSection data={insightsData} />
        )}

        {/* Business Metrics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">📈 Registrazioni & Programmi (30 giorni)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.businessMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date_id"
                stroke="#9CA3AF"
                tickFormatter={(value) => new Date(value).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('it-IT')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="new_registrations"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Registrazioni"
              />
              <Line
                type="monotone"
                dataKey="program_creations"
                stroke="#10B981"
                strokeWidth={2}
                name="Programmi"
              />
              <Line
                type="monotone"
                dataKey="workouts_logged"
                stroke="#F59E0B"
                strokeWidth={2}
                name="Workout"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Training Frequency Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">📅 Frequenza Allenamento Settimanale</h2>
          {dashboardData.programPopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={
                // Aggrega per frequenza (estrae il numero dal campo split)
                Object.entries(
                  dashboardData.programPopularity.reduce((acc, p) => {
                    // Estrai frequenza dallo split (es: "Full Body 3x" -> "3x")
                    const freqMatch = p.split.match(/(\d+)x/);
                    const frequency = freqMatch ? `${freqMatch[1]}x/settimana` : p.split;
                    acc[frequency] = (acc[frequency] || 0) + p.total_programs;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([freq, count]) => ({ frequency: freq, count }))
                .sort((a, b) => {
                  const aNum = parseInt(a.frequency);
                  const bNum = parseInt(b.frequency);
                  return aNum - bNum;
                })
              }>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="frequency" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value: any) => [`${value} utenti`, 'Totale']}
                />
                <Bar dataKey="count" fill="#F59E0B" name="Utenti" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Nessun dato disponibile</p>
          )}
        </motion.div>

        {/* Program Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">🏆 Programmi Più Popolari (per Goal + Location)</h2>
          {dashboardData.programPopularity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.programPopularity.slice(0, 8).map(p => ({
                ...p,
                programLabel: `${p.goal} - ${p.location}`
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="programLabel"
                  stroke="#9CA3AF"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  fontSize={11}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value: any, name: string, props: any) => {
                    if (name === 'Programmi') {
                      return [`${value} programmi`, `${props.payload.level} - ${props.payload.split}`];
                    }
                    return value;
                  }}
                />
                <Bar dataKey="total_programs" fill="#8B5CF6" name="Programmi" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Nessun dato disponibile</p>
          )}
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold mb-4">👥 Ultimi Utenti Registrati</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Registrato</th>
                  <th className="pb-2">Programmi</th>
                  <th className="pb-2">Workout</th>
                  <th className="pb-2">Stato</th>
                  <th className="pb-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentUsers.map((user, idx) => (
                  <tr key={user.user_id} className="border-b border-gray-700/50">
                    <td className="py-3 text-sm">{user.email}</td>
                    <td className="py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="py-3 text-sm">{user.total_programs_created}</td>
                    <td className="py-3 text-sm">{user.total_workouts_logged}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.is_active
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-gray-700/30 text-gray-400'
                        }`}
                      >
                        {user.is_active ? 'Attivo' : 'Inattivo'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setResetModal({
                          isOpen: true,
                          userId: user.user_id,
                          userEmail: user.email,
                          isResetting: false
                        })}
                        disabled={user.total_programs_created === 0}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          user.total_programs_created > 0
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800'
                            : 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                        }`}
                        title={user.total_programs_created === 0 ? 'Nessun programma da resettare' : 'Reset programma'}
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {resetModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !resetModal.isResetting && setResetModal({ isOpen: false, userId: '', userEmail: '', isResetting: false })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Programma</h3>
                  <p className="text-gray-400 text-sm">Questa azione è irreversibile</p>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  Stai per eliminare <strong>tutti i programmi</strong> dell'utente:
                </p>
                <p className="text-white font-mono text-sm mt-2 bg-gray-700/50 px-3 py-2 rounded">
                  {resetModal.userEmail}
                </p>
                <p className="text-amber-400 text-xs mt-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  L'utente dovrà rifare l'onboarding per generare un nuovo programma.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResetModal({ isOpen: false, userId: '', userEmail: '', isResetting: false })}
                  disabled={resetModal.isResetting}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => resetUserProgram(resetModal.userId)}
                  disabled={resetModal.isResetting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetModal.isResetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resettando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Conferma Reset
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ================================================================
// SUB-COMPONENTS
// ================================================================

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function KPICard({ title, value, subtitle, icon, color }: KPICardProps) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-600 to-orange-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
        <span className="text-white/80 text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      {subtitle && <div className="text-white/60 text-sm mt-1">{subtitle}</div>}
    </motion.div>
  );
}

interface ConversionCardProps {
  title: string;
  rate: number;
}

function ConversionCard({ title, rate }: ConversionCardProps) {
  const displayRate = isNaN(rate) ? 0 : rate;
  const colorClass = displayRate >= 50 ? 'text-green-400' : displayRate >= 20 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-gray-700/50 rounded-lg p-4">
      <div className="text-gray-400 text-xs mb-2">{title}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {displayRate.toFixed(1)}%
      </div>
    </div>
  );
}

// ================================================================
// USER INSIGHTS SECTION
// ================================================================

const GOAL_LABELS: Record<string, string> = {
  ipertrofia: 'Ipertrofia',
  forza: 'Forza',
  tonificazione: 'Tonificazione',
  dimagrimento: 'Dimagrimento',
  resistenza: 'Resistenza',
  prestazioni_sportive: 'Prestazioni',
  benessere: 'Benessere',
  motor_recovery: 'Riabilitazione',
  pre_partum: 'Pre-partum',
  post_partum: 'Post-partum',
  disabilita: 'Accessibilità',
};

const GENDER_LABELS: Record<string, string> = {
  M: 'Uomo',
  F: 'Donna',
  Other: 'Altro',
  'N/A': 'N/D',
};

const LOCATION_LABELS: Record<string, string> = {
  gym: 'Palestra',
  home: 'Casa',
  home_gym: 'Home Gym',
  'N/A': 'N/D',
};

const GENDER_COLORS = ['#3B82F6', '#EC4899', '#8B5CF6', '#6B7280'];
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const CLICK_TARGET_LABELS: Record<string, string> = {
  pain_monitoring: 'Monitoraggio Dolore',
  strength_volume: 'Forza & Volume',
  workout_history: 'Storico Allenamenti',
  personal_records: 'Record Personali',
  start_workout: 'Inizia Allenamento',
  running_session: 'Sessione Corsa',
  view_program: 'Vedi Programma',
};

function UserInsightsSection({ data }: { data: UserInsightsData }) {
  const { demographics, onboarding, clicks } = data;

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center gap-3 pt-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wider">User Insights</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      {/* Row 1: Demografia */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
      >
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold">Demografia Utenti</h2>
          <span className="text-gray-400 text-sm ml-auto">{demographics.totalUsers} utenti con onboarding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Genere - Pie */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Genere</h3>
            {demographics.genderDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={demographics.genderDistribution.map(d => ({
                      name: GENDER_LABELS[d.gender] || d.gender,
                      value: d.count
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {demographics.genderDistribution.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value} utenti`, 'Totale']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">Nessun dato</p>
            )}
          </div>

          {/* Età - Bar */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Fasce d'età</h3>
            {demographics.ageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={demographics.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="age_range" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}`, 'Utenti']}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">Nessun dato</p>
            )}
          </div>

          {/* Goal - Bar orizzontale */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Obiettivi</h3>
            {demographics.goalDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={demographics.goalDistribution.map(d => ({
                    name: GOAL_LABELS[d.goal] || d.goal,
                    count: d.count
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}`, 'Utenti']}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm">Nessun dato</p>
            )}
          </div>

          {/* Location + Frequenza - Pills */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Location</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {demographics.locationDistribution.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-700/50 rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium">{LOCATION_LABELS[item.location] || item.location}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5 font-bold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 text-center">Frequenza settimanale</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {demographics.frequencyDistribution.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-gray-700/50 rounded-full px-4 py-2"
                  >
                    <span className="text-sm font-medium">{item.frequency}x/sett</span>
                    <span className="text-xs bg-purple-500/20 text-purple-400 rounded-full px-2 py-0.5 font-bold">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 2: Onboarding Timing + Dashboard Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Onboarding Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold">Onboarding</h2>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{onboarding.avgTimeMinutes}m</div>
              <div className="text-xs text-gray-400">Tempo medio</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{onboarding.completionRate}%</div>
              <div className="text-xs text-gray-400">Completion</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{onboarding.totalCompleted}</div>
              <div className="text-xs text-gray-400">Completati</div>
            </div>
          </div>

          {/* Time distribution */}
          <h3 className="text-sm font-medium text-gray-400 mb-2">Distribuzione tempi</h3>
          {onboarding.timeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={onboarding.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time_bucket" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value}`, 'Utenti']}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8 text-sm">Nessun dato onboarding timing</p>
          )}
        </motion.div>

        {/* Dashboard Clicks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Dashboard Engagement</h2>
            <span className="text-gray-400 text-sm ml-auto">30 giorni</span>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{clicks.totalClicks}</div>
              <div className="text-xs text-gray-400">Click totali</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{clicks.uniqueUsers}</div>
              <div className="text-xs text-gray-400">Utenti unici</div>
            </div>
          </div>

          {/* Click by target - horizontal bars */}
          <h3 className="text-sm font-medium text-gray-400 mb-2">Azioni più cliccate</h3>
          {clicks.clicksByTarget.length > 0 ? (
            <div className="space-y-2">
              {clicks.clicksByTarget.map((item, i) => {
                const maxClicks = clicks.clicksByTarget[0]?.clicks || 1;
                const percent = Math.round((item.clicks / maxClicks) * 100);
                return (
                  <div key={item.click_target} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-gray-300 truncate">
                      {CLICK_TARGET_LABELS[item.click_target] || item.click_target}
                    </div>
                    <div className="flex-1 h-6 bg-gray-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: CHART_COLORS[i % CHART_COLORS.length]
                        }}
                      />
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-bold">{item.clicks}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.unique_users}u)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 text-sm">Nessun click registrato. I dati appariranno quando gli utenti useranno la dashboard.</p>
          )}
        </motion.div>
      </div>
    </>
  );
}
