/**
 * Achievements Page
 * Displays all achievements and user progress
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { AchievementProgress } from '@trainsmart/shared';
import { getAchievementProgress } from '@trainsmart/shared';

type FilterType = 'all' | 'unlocked' | 'locked';

export function Achievements() {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const result = await getAchievementProgress();
      if (result.success && result.data) {
        setAchievements(result.data);
      }
    } catch (error) {
      console.error('Load achievements error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.is_unlocked;
    if (filter === 'locked') return !a.is_unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.is_unlocked)
    .reduce((sum, a) => sum + (a.achievement.points || 0), 0);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'consistency': return '📅';
      case 'strength': return '💪';
      case 'volume': return '📊';
      case 'milestone': return '🏆';
      case 'social': return '👥';
      default: return '🎖️';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Achievement</h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{unlockedCount}</div>
              <div className="text-white/80 text-sm">Sbloccati</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{achievements.length}</div>
              <div className="text-white/80 text-sm">Totali</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">{totalPoints}</div>
              <div className="text-white/80 text-sm">Punti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' && 'Tutti'}
              {f === 'unlocked' && 'Sbloccati'}
              {f === 'locked' && 'Da sbloccare'}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="grid gap-4">
          {filteredAchievements.map((item, index) => (
            <motion.div
              key={item.achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-xl border ${
                item.is_unlocked
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className="p-4 flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRarityColor(
                    item.achievement.rarity
                  )} flex items-center justify-center text-3xl ${
                    !item.is_unlocked && 'opacity-40 grayscale'
                  }`}
                >
                  {item.achievement.icon || getCategoryIcon(item.achievement.category)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${item.is_unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {item.achievement.name}
                    </h3>
                    {item.is_unlocked && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                  <p className={`text-sm ${item.is_unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {item.achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!item.is_unlocked && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{item.current_value} / {item.target_value}</span>
                        <span>{Math.round(item.progress_percent)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress_percent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlocked Date */}
                  {item.is_unlocked && item.unlocked_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sbloccato il {new Date(item.unlocked_at).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>

                {/* Points */}
                <div className={`text-right ${item.is_unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                  <div className="text-lg font-bold">+{item.achievement.points}</div>
                  <div className="text-xs">punti</div>
                </div>
              </div>

              {/* Rarity Badge */}
              {item.achievement.rarity && item.achievement.rarity !== 'common' && (
                <div
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    item.achievement.rarity === 'legendary'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : item.achievement.rarity === 'epic'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {item.achievement.rarity}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl block mb-4">
              {filter === 'unlocked' ? '🔒' : '🎖️'}
            </span>
            <p className="text-gray-400">
              {filter === 'unlocked'
                ? 'Non hai ancora sbloccato nessun achievement'
                : 'Tutti gli achievement sono stati sbloccati!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Achievements;
