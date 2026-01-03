/**
 * COMPONENT: FeatureGate
 * Wrapper per proteggere UI in base all'accesso feature
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Crown } from 'lucide-react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';

// ================================================================
// FeatureGate - Base Component
// ================================================================

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;

  /** Contenuto da mostrare se non ha accesso */
  fallback?: ReactNode;

  /** Se true, mostra loading spinner durante il check */
  showLoading?: boolean;

  /** Callback quando accesso negato */
  onAccessDenied?: () => void;
}

export function FeatureGate({
  featureKey,
  children,
  fallback = null,
  showLoading = false,
  onAccessDenied
}: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureAccess(featureKey);

  // Loading state
  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse bg-slate-700/30 rounded-lg p-4">
        <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    if (onAccessDenied) {
      onAccessDenied();
    }
    return <>{fallback}</>;
  }

  // Access granted
  return <>{children}</>;
}

// ================================================================
// FeatureGateWithUpgrade - Con prompt di upgrade
// ================================================================

interface FeatureGateWithUpgradeProps extends Omit<FeatureGateProps, 'fallback'> {
  /** Tier richiesto per questa feature */
  requiredTier?: 'premium' | 'elite';

  /** Testo CTA personalizzato */
  upgradeCTA?: string;

  /** Titolo del blocco */
  title?: string;

  /** Stile compatto */
  compact?: boolean;
}

export function FeatureGateWithUpgrade({
  featureKey,
  children,
  requiredTier = 'premium',
  upgradeCTA,
  title,
  compact = false,
  ...props
}: FeatureGateWithUpgradeProps) {
  const tierConfig = {
    premium: {
      icon: Sparkles,
      color: 'purple',
      label: 'Premium',
      defaultCTA: 'Passa a Premium per sbloccare questa funzionalita'
    },
    elite: {
      icon: Crown,
      color: 'amber',
      label: 'Elite',
      defaultCTA: 'Passa a Elite per sbloccare questa funzionalita'
    }
  };

  const config = tierConfig[requiredTier];
  const Icon = config.icon;
  const cta = upgradeCTA || config.defaultCTA;

  const upgradeFallback = compact ? (
    // Versione compatta
    <div className={`bg-gradient-to-r from-${config.color}-900/20 to-${config.color}-800/10
                     border border-${config.color}-500/30 rounded-lg p-3 flex items-center gap-3`}>
      <Lock className={`w-5 h-5 text-${config.color}-400`} />
      <span className="text-sm text-slate-300 flex-1">{cta}</span>
      <Link
        to="/pricing"
        className={`px-3 py-1 bg-${config.color}-600 hover:bg-${config.color}-500
                    rounded text-sm font-medium transition`}
      >
        Upgrade
      </Link>
    </div>
  ) : (
    // Versione standard
    <div className={`bg-gradient-to-r from-${config.color}-900/30 to-slate-800/50
                     border border-${config.color}-500/30 rounded-xl p-6 text-center`}>
      <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-${config.color}-900/50
                       flex items-center justify-center`}>
        <Icon className={`w-7 h-7 text-${config.color}-400`} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {title || `Funzionalita ${config.label}`}
      </h3>
      <p className="text-slate-400 text-sm mb-4">{cta}</p>
      <Link
        to="/pricing"
        className={`inline-block px-6 py-2 bg-gradient-to-r
                    from-${config.color}-600 to-${config.color}-500
                    hover:from-${config.color}-500 hover:to-${config.color}-400
                    rounded-lg font-medium transition shadow-lg
                    shadow-${config.color}-500/20`}
      >
        Scopri i Piani
      </Link>
    </div>
  );

  return (
    <FeatureGate featureKey={featureKey} fallback={upgradeFallback} {...props}>
      {children}
    </FeatureGate>
  );
}

// ================================================================
// FeatureGateHidden - Nasconde completamente se non ha accesso
// ================================================================

interface FeatureGateHiddenProps {
  featureKey: string;
  children: ReactNode;
}

export function FeatureGateHidden({ featureKey, children }: FeatureGateHiddenProps) {
  return (
    <FeatureGate featureKey={featureKey} fallback={null}>
      {children}
    </FeatureGate>
  );
}

// ================================================================
// FeatureGateDisabled - Mostra disabilitato se non ha accesso
// ================================================================

interface FeatureGateDisabledProps {
  featureKey: string;
  children: ReactNode;

  /** Tooltip da mostrare quando disabilitato */
  tooltip?: string;
}

export function FeatureGateDisabled({
  featureKey,
  children,
  tooltip = 'Funzionalita non disponibile per il tuo piano'
}: FeatureGateDisabledProps) {
  const { hasAccess, isLoading } = useFeatureAccess(featureKey);

  if (isLoading) {
    return <div className="opacity-50 pointer-events-none">{children}</div>;
  }

  if (!hasAccess) {
    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1
                        bg-slate-800 text-slate-300 text-xs rounded-lg opacity-0
                        group-hover:opacity-100 transition-opacity whitespace-nowrap
                        pointer-events-none">
          {tooltip}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ================================================================
// FeatureBadge - Badge che mostra il tier richiesto
// ================================================================

interface FeatureBadgeProps {
  tier: 'base' | 'premium' | 'elite';
  size?: 'sm' | 'md';
}

export function FeatureBadge({ tier, size = 'sm' }: FeatureBadgeProps) {
  const config = {
    base: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-500/30' },
    premium: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-500/30' },
    elite: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-500/30' }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const c = config[tier];

  return (
    <span className={`${c.bg} ${c.text} ${c.border} ${sizeClasses} border rounded-full font-medium uppercase`}>
      {tier}
    </span>
  );
}

export default FeatureGate;
