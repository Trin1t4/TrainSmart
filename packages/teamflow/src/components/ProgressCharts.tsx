import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Award, Flame, Dumbbell, Calendar } from "lucide-react";

export default function ProgressCharts() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [prs, setPrs] = useState([]);
  const [timeframe, setTimeframe] = useState(12); // weeks
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Stats generali
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Progressi settimanali
      const weeklyRes = await fetch(`/api/stats/weekly?weeks=${timeframe}`);
      const weeklyData = await weeklyRes.json();

      // Formatta dati per grafici
      const formattedWeekly = weeklyData.map((w) => ({
        week: new Date(w.weekStart).toLocaleDateString("it-IT", {
          day: "2-digit",
          month: "short",
        }),
        workouts: w.totalWorkouts,
        volume: Math.round(parseFloat(w.totalVolume)),
        sets: w.totalSets,
        reps: w.totalReps,
      }));
      setWeeklyData(formattedWeekly);

      // Personal Records
      const prsRes = await fetch("/api/prs");
      const prsData = await prsRes.json();
      setPrs(prsData.slice(0, 10)); // Ultimi 10 PRs
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">I Tuoi Progressi</h1>
          <p className="text-slate-400">Analisi delle tue performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Dumbbell className="w-6 h-6" />}
            label="Workout Totali"
            value={stats?.totalWorkouts || 0}
            color="emerald"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Volume Totale"
            value={`${(stats?.totalVolume || 0).toLocaleString()} kg`}
            color="blue"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Personal Records"
            value={stats?.totalPRs || 0}
            color="amber"
          />
          <StatCard
            icon={<Flame className="w-6 h-6" />}
            label="Streak Giorni"
            value={stats?.currentStreak || 0}
            color="orange"
          />
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6">
          {[4, 8, 12, 26].map((weeks) => (
            <button
              key={weeks}
              onClick={() => setTimeframe(weeks)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeframe === weeks
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {weeks} settimane
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Volume Chart */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Volume Settimanale (kg)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="week"
                  stroke="#94a3b8"
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Workouts Chart */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              Workout per Settimana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="week"
                  stroke="#94a3b8"
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="workouts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sets & Reps Chart */}
          <div className="bg-slate-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Set e Ripetizioni</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="week"
                  stroke="#94a3b8"
                  style={{ fontSize: 12 }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sets"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Set"
                />
                <Line
                  type="monotone"
                  dataKey="reps"
                  stroke="#ec4899"
                  strokeWidth={2}
                  name="Ripetizioni"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Personal Records */}
          <div className="bg-slate-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Personal Records</h3>
              <Award className="w-5 h-5 text-amber-500" />
            </div>

            {prs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun PR ancora</p>
                <p className="text-sm">Completa i tuoi primi workout!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto">
                {prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{pr.exerciseName}</h4>
                        <p className="text-xs text-slate-400">
                          {new Date(pr.achievedAt).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-500">
                          {parseFloat(pr.value).toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400 uppercase">
                          {pr.recordType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              label="Media Workout/Settimana"
              value={calculateAvgWorkouts(weeklyData)}
            />
            <InsightCard
              label="Volume Medio/Workout"
              value={`${calculateAvgVolume(weeklyData)} kg`}
            />
            <InsightCard
              label="Crescita Volume"
              value={calculateVolumeGrowth(weeklyData)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    amber: "bg-amber-600",
    orange: "bg-orange-600",
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div
        className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
      <p className="text-sm opacity-90 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function calculateAvgWorkouts(data) {
  if (data.length === 0) return "0";
  const total = data.reduce((sum, w) => sum + w.workouts, 0);
  return (total / data.length).toFixed(1);
}

function calculateAvgVolume(data) {
  if (data.length === 0) return "0";
  const workoutsData = data.filter((w) => w.workouts > 0);
  if (workoutsData.length === 0) return "0";

  const totalVolume = workoutsData.reduce((sum, w) => sum + w.volume, 0);
  const totalWorkouts = workoutsData.reduce((sum, w) => sum + w.workouts, 0);

  return Math.round(totalVolume / totalWorkouts).toLocaleString();
}

function calculateVolumeGrowth(data) {
  if (data.length < 2) return "+0%";

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const avgFirst =
    firstHalf.reduce((sum, w) => sum + w.volume, 0) / firstHalf.length;
  const avgSecond =
    secondHalf.reduce((sum, w) => sum + w.volume, 0) / secondHalf.length;

  const growth = ((avgSecond - avgFirst) / avgFirst) * 100;
  return `${growth > 0 ? "+" : ""}${growth.toFixed(0)}%`;
}
