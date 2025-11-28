import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Activity, TrendingUp, Calendar, Award, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { useCurrentProgram } from '../hooks/useProgram';
import ProgressCharts from '../components/ProgressCharts';

export default function Stats() {
  const { t } = useTranslation();
  const { data: program } = useCurrentProgram();
  const [screeningData, setScreeningData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('screening_data');
    if (data) {
      setScreeningData(JSON.parse(data));
    }
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
      </div>
    </div>
  );
}
