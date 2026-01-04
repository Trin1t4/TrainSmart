/**
 * ADMIN FEATURES PAGE
 * Pannello per gestire feature flags
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  ToggleLeft,
  ToggleRight,
  Users,
  Plus,
  Search,
  Dumbbell,
  Bot,
  BarChart3,
  Users2,
  Headphones,
  FlaskConical,
  RefreshCw
} from 'lucide-react';
import { isAdmin } from '@trainsmart/shared';
import {
  adminListFeatures,
  adminToggleFeature,
  adminSetFeatureTier,
  adminCreateFeature,
  type AdminFeature,
  type SubscriptionTier
} from '../lib/featureService';

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  base: 'bg-green-900/30 text-green-400 border-green-500/30',
  premium: 'bg-purple-900/30 text-purple-400 border-purple-500/30',
  elite: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
};

// Category icons
const CATEGORY_ICONS: Record<string, typeof Settings> = {
  training: Dumbbell,
  ai: Bot,
  analytics: BarChart3,
  social: Users2,
  support: Headphones,
  beta: FlaskConical,
};

export default function AdminFeatures() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Create feature form state
  const [newFeature, setNewFeature] = useState({
    key: '',
    name: '',
    description: '',
    min_tier: 'base' as SubscriptionTier,
    category: 'training'
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  async function checkAdminAndLoadData() {
    try {
      setLoading(true);

      const adminStatus = await isAdmin();
      if (!adminStatus) {
        setError('Accesso negato');
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      setIsAdminUser(true);
      await loadFeatures();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function loadFeatures() {
    try {
      setRefreshing(true);
      const data = await adminListFeatures();
      setFeatures(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore caricamento';
      console.error('Errore caricamento features:', errorMessage);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggleFeature(feature: AdminFeature) {
    try {
      await adminToggleFeature(feature.key, !feature.is_enabled);
      await loadFeatures();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore';
      console.error('Errore toggle:', errorMessage);
    }
  }

  async function handleChangeTier(feature: AdminFeature, newTier: SubscriptionTier) {
    try {
      await adminSetFeatureTier(feature.key, newTier);
      await loadFeatures();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore';
      console.error('Errore cambio tier:', errorMessage);
    }
  }

  async function handleCreateFeature(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminCreateFeature(
        newFeature.key,
        newFeature.name,
        newFeature.description,
        newFeature.min_tier,
        newFeature.category
      );
      setShowCreateModal(false);
      setNewFeature({ key: '', name: '', description: '', min_tier: 'base', category: 'training' });
      await loadFeatures();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Errore';
      console.error('Errore creazione:', errorMessage);
    }
  }

  // Get unique categories
  const categories = ['all', ...new Set(features.map(f => f.category || 'other'))];

  // Filter features
  const filteredFeatures = features.filter(f => {
    const matchesCategory = filter === 'all' || f.category === filter;
    const matchesSearch = !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-400">Accesso Negato</h2>
          <p className="text-slate-300 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-emerald-400" />
                Feature Flags
              </h1>
              <p className="text-slate-400 text-sm">Gestione feature e accessi per tier</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadFeatures}
              disabled={refreshing}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuova Feature
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cerca feature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg
                         focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => {
              const Icon = cat !== 'all' ? CATEGORY_ICONS[cat] || Settings : null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    filter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {cat === 'all' ? 'Tutte' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-white">{features.length}</div>
            <div className="text-sm text-slate-400">Features Totali</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">
              {features.filter(f => f.is_enabled).length}
            </div>
            <div className="text-sm text-slate-400">Attive</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">
              {features.filter(f => f.min_tier === 'premium').length}
            </div>
            <div className="text-sm text-slate-400">Premium</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-amber-400">
              {features.filter(f => f.min_tier === 'elite').length}
            </div>
            <div className="text-sm text-slate-400">Elite</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4">
          {filteredFeatures.map((feature, idx) => {
            const CategoryIcon = CATEGORY_ICONS[feature.category || ''] || Settings;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`bg-slate-800/50 rounded-xl p-6 border ${
                  feature.is_enabled ? 'border-slate-700' : 'border-red-900/50 bg-red-900/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        feature.is_enabled ? 'bg-slate-700' : 'bg-red-900/30'
                      }`}>
                        <CategoryIcon className={`w-5 h-5 ${
                          feature.is_enabled ? 'text-emerald-400' : 'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
                        <code className="text-xs text-slate-500 font-mono">{feature.key}</code>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{feature.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {feature.override_count} override
                      </span>
                      <span>
                        Creata: {new Date(feature.created_at).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggleFeature(feature)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        feature.is_enabled
                          ? 'bg-green-600 hover:bg-green-500'
                          : 'bg-red-600 hover:bg-red-500'
                      }`}
                    >
                      {feature.is_enabled ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          Attiva
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          Disattiva
                        </>
                      )}
                    </button>

                    {/* Tier Selector */}
                    <div className="flex gap-1">
                      {(['base', 'premium', 'elite'] as const).map(tier => (
                        <button
                          key={tier}
                          onClick={() => handleChangeTier(feature, tier)}
                          className={`px-3 py-1.5 rounded border text-xs font-medium transition uppercase ${
                            feature.min_tier === tier
                              ? TIER_COLORS[tier]
                              : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-600'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nessuna feature trovata
          </div>
        )}
      </div>

      {/* Create Feature Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700"
          >
            <h2 className="text-xl font-bold mb-4">Nuova Feature</h2>

            <form onSubmit={handleCreateFeature} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Key (identificatore)</label>
                <input
                  type="text"
                  value={newFeature.key}
                  onChange={(e) => setNewFeature({ ...newFeature, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                  placeholder="es. new_feature"
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                             focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                  placeholder="Nome della feature"
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                             focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Descrizione</label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  placeholder="Descrizione della feature"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                             focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tier Minimo</label>
                  <select
                    value={newFeature.min_tier}
                    onChange={(e) => setNewFeature({ ...newFeature, min_tier: e.target.value as SubscriptionTier })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="base">Base</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                  <select
                    value={newFeature.category}
                    onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg
                               focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="training">Training</option>
                    <option value="ai">AI</option>
                    <option value="analytics">Analytics</option>
                    <option value="social">Social</option>
                    <option value="support">Support</option>
                    <option value="beta">Beta</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition font-medium"
                >
                  Crea Feature
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
