/**
 * Share Card Generator
 * Generates shareable images from workout data, PRs, streaks, and achievements
 */

import React, { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import type {
  ShareCardData,
  WorkoutShareCardData,
  PRShareCardData,
  StreakShareCardData,
  AchievementShareCardData,
} from '@trainsmart/shared/types/social.types';

// ============================================================
// SHARE CARD WRAPPER (Hidden, used for generation)
// ============================================================

interface ShareCardWrapperProps {
  children: React.ReactNode;
  gradient?: [string, string];
}

const ShareCardWrapper: React.FC<ShareCardWrapperProps> = ({
  children,
  gradient = ['#10b981', '#14b8a6'], // emerald to teal
}) => {
  return (
    <div
      className="share-card-wrapper"
      style={{
        width: '1080px',
        height: '1920px',
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      {children}
    </div>
  );
};

// ============================================================
// WORKOUT SHARE CARD
// ============================================================

interface WorkoutShareCardProps {
  data: WorkoutShareCardData;
}

export const WorkoutShareCard: React.FC<WorkoutShareCardProps> = ({ data }) => {
  return (
    <ShareCardWrapper gradient={['#10b981', '#0d9488']}>
      {/* Header */}
      <div style={{ marginBottom: '40px', zIndex: 1 }}>
        <div style={{ fontSize: '28px', opacity: 0.8, marginBottom: '8px' }}>
          {data.date}
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>
          WORKOUT
        </h1>
        <h2 style={{ fontSize: '48px', fontWeight: '600', margin: 0, opacity: 0.9 }}>
          COMPLETATO
        </h2>
      </div>

      {/* Main Stats */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '40px',
          zIndex: 1,
        }}
      >
        {/* Duration & Exercises */}
        <div style={{ display: 'flex', gap: '40px' }}>
          <StatBox
            label="DURATA"
            value={`${data.duration}'`}
            size="large"
          />
          <StatBox
            label="ESERCIZI"
            value={data.exercisesCount.toString()}
            size="large"
          />
        </div>

        {/* RPE if available */}
        {data.sessionRpe && (
          <StatBox
            label="RPE SESSIONE"
            value={data.sessionRpe.toFixed(1)}
            size="medium"
          />
        )}

        {/* Top Exercises */}
        {data.topExercises && data.topExercises.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '24px', opacity: 0.7, marginBottom: '16px' }}>
              TOP ESERCIZI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.topExercises.slice(0, 3).map((ex, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '28px', fontWeight: '600' }}>
                    {ex.name}
                  </span>
                  <span style={{ fontSize: '24px', opacity: 0.9 }}>
                    {ex.sets}x{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Volume if available */}
        {data.totalVolume && (
          <StatBox
            label="VOLUME TOTALE"
            value={`${Math.round(data.totalVolume).toLocaleString()} kg`}
            size="medium"
          />
        )}
      </div>

      {/* Footer */}
      <CardFooter userName={data.userName} />
    </ShareCardWrapper>
  );
};

// ============================================================
// PR SHARE CARD
// ============================================================

interface PRShareCardProps {
  data: PRShareCardData;
}

export const PRShareCard: React.FC<PRShareCardProps> = ({ data }) => {
  return (
    <ShareCardWrapper gradient={['#f97316', '#dc2626']}>
      {/* Header */}
      <div style={{ marginBottom: '40px', zIndex: 1 }}>
        <div style={{ fontSize: '28px', opacity: 0.8, marginBottom: '8px' }}>
          {data.date}
        </div>
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>
          NUOVO
        </h1>
        <h2 style={{ fontSize: '96px', fontWeight: '800', margin: 0 }}>
          RECORD!
        </h2>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Trophy Icon */}
        <div style={{ fontSize: '120px', marginBottom: '40px' }}>
          🏆
        </div>

        {/* Exercise Name */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '40px',
            textTransform: 'uppercase',
          }}
        >
          {data.exerciseName}
        </div>

        {/* New Record Value */}
        <div
          style={{
            fontSize: '144px',
            fontWeight: '900',
            lineHeight: 1,
            marginBottom: '20px',
          }}
        >
          {data.newValue}
          <span style={{ fontSize: '64px', fontWeight: '600' }}>{data.unit}</span>
        </div>

        {/* Improvement */}
        {data.previousValue && data.improvementPercent && (
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span>Prima: {data.previousValue}{data.unit}</span>
            <span style={{ fontWeight: 'bold', color: '#fef08a' }}>
              +{data.improvementPercent.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <CardFooter userName={data.userName} />
    </ShareCardWrapper>
  );
};

// ============================================================
// STREAK SHARE CARD
// ============================================================

interface StreakShareCardProps {
  data: StreakShareCardData;
}

export const StreakShareCard: React.FC<StreakShareCardProps> = ({ data }) => {
  return (
    <ShareCardWrapper gradient={['#f59e0b', '#ea580c']}>
      {/* Header */}
      <div style={{ marginBottom: '40px', zIndex: 1 }}>
        <div style={{ fontSize: '28px', opacity: 0.8, marginBottom: '8px' }}>
          {data.date}
        </div>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>
          ON FIRE!
        </h1>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Fire Icon */}
        <div style={{ fontSize: '160px', marginBottom: '20px' }}>
          🔥
        </div>

        {/* Current Streak */}
        <div
          style={{
            fontSize: '200px',
            fontWeight: '900',
            lineHeight: 1,
          }}
        >
          {data.currentStreak}
        </div>
        <div style={{ fontSize: '48px', fontWeight: '600', marginTop: '10px' }}>
          GIORNI
        </div>
        <div style={{ fontSize: '32px', opacity: 0.8 }}>
          DI FILA
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: '60px',
            display: 'flex',
            gap: '40px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: '700' }}>
              {data.longestStreak}
            </div>
            <div style={{ fontSize: '20px', opacity: 0.8 }}>
              RECORD
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: '700' }}>
              {data.workoutsThisMonth}
            </div>
            <div style={{ fontSize: '20px', opacity: 0.8 }}>
              QUESTO MESE
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <CardFooter userName={data.userName} />
    </ShareCardWrapper>
  );
};

// ============================================================
// ACHIEVEMENT SHARE CARD
// ============================================================

interface AchievementShareCardProps {
  data: AchievementShareCardData;
}

const RARITY_GRADIENTS: Record<string, [string, string]> = {
  common: ['#6b7280', '#4b5563'],
  uncommon: ['#10b981', '#059669'],
  rare: ['#3b82f6', '#2563eb'],
  epic: ['#8b5cf6', '#7c3aed'],
  legendary: ['#f59e0b', '#d97706'],
};

export const AchievementShareCard: React.FC<AchievementShareCardProps> = ({ data }) => {
  const gradient = RARITY_GRADIENTS[data.achievementRarity] || RARITY_GRADIENTS.common;

  return (
    <ShareCardWrapper gradient={gradient}>
      {/* Header */}
      <div style={{ marginBottom: '40px', zIndex: 1 }}>
        <div style={{ fontSize: '28px', opacity: 0.8, marginBottom: '8px' }}>
          {data.date}
        </div>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', margin: 0, lineHeight: 1.1 }}>
          ACHIEVEMENT
        </h1>
        <h2 style={{ fontSize: '48px', fontWeight: '600', margin: 0, opacity: 0.9 }}>
          SBLOCCATO!
        </h2>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            border: '8px solid rgba(255,255,255,0.3)',
          }}
        >
          <span style={{ fontSize: '120px' }}>
            {getAchievementEmoji(data.achievementIcon)}
          </span>
        </div>

        {/* Achievement Name */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {data.achievementName}
        </div>

        {/* Rarity Badge */}
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '24px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          {data.achievementRarity}
        </div>

        {/* Points */}
        <div style={{ marginTop: '40px', fontSize: '32px', opacity: 0.9 }}>
          +{data.points} punti
        </div>
      </div>

      {/* Footer */}
      <CardFooter userName={data.userName} />
    </ShareCardWrapper>
  );
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

interface StatBoxProps {
  label: string;
  value: string;
  size?: 'small' | 'medium' | 'large';
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, size = 'medium' }) => {
  const sizes = {
    small: { label: '20px', value: '48px', padding: '16px 24px' },
    medium: { label: '24px', value: '64px', padding: '24px 32px' },
    large: { label: '28px', value: '96px', padding: '32px 40px' },
  };

  const s = sizes[size];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: s.padding,
        flex: 1,
      }}
    >
      <div style={{ fontSize: s.label, opacity: 0.7, marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: s.value, fontWeight: '800' }}>
        {value}
      </div>
    </div>
  );
};

const CardFooter: React.FC<{ userName: string }> = ({ userName }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 1,
      marginTop: '40px',
    }}
  >
    <div style={{ fontSize: '28px', fontWeight: '600' }}>
      @{userName}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        TF
      </div>
      <span style={{ fontSize: '24px', fontWeight: '600' }}>TrainFlow</span>
    </div>
  </div>
);

// Helper function to map icon names to emojis
function getAchievementEmoji(iconName: string): string {
  const iconMap: Record<string, string> = {
    Dumbbell: '💪',
    Activity: '🏃',
    Target: '🎯',
    Medal: '🏅',
    Trophy: '🏆',
    Award: '🎖️',
    Crown: '👑',
    Flame: '🔥',
    TrendingUp: '📈',
    Zap: '⚡',
    Rocket: '🚀',
    BarChart: '📊',
    BarChart2: '📊',
    BarChart3: '📊',
    Mountain: '⛰️',
    Calendar: '📅',
    Sun: '☀️',
    Moon: '🌙',
    Swords: '⚔️',
    CheckCircle: '✅',
    RefreshCw: '🔄',
  };

  return iconMap[iconName] || '🏆';
}

// ============================================================
// HOOK: useShareCard
// ============================================================

export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = useCallback(async (
    element: HTMLElement
  ): Promise<Blob | null> => {
    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('[ShareCard] Error generating image:', error);
      return null;
    }
  }, []);

  const downloadImage = useCallback(async (
    element: HTMLElement,
    filename: string = 'trainflow-share.png'
  ): Promise<boolean> => {
    try {
      const blob = await generateImage(element);
      if (!blob) return false;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('[ShareCard] Error downloading image:', error);
      return false;
    }
  }, [generateImage]);

  return {
    cardRef,
    generateImage,
    downloadImage,
  };
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  WorkoutShareCard,
  PRShareCard,
  StreakShareCard,
  AchievementShareCard,
  useShareCard,
};
