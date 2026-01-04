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
import { motion } from 'framer-motion';
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
import { isAdmin as checkIsAdmin, getAdminDashboardData, type AdminDashboardData } from '@trainsmart/shared';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

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

      // Load dashboard data
      const { data, error: dataError } = await getAdminDashboardData();

      if (dataError) {
        throw new Error('Errore caricamento dati: ' + dataError.message);
      }

      setDashboardData(data);
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
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
