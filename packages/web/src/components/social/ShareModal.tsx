/**
 * Share Modal
 * Modal component for sharing workout results, PRs, streaks, and achievements
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import {
  WorkoutShareCard,
  PRShareCard,
  StreakShareCard,
  AchievementShareCard,
} from './ShareCardGenerator';
import {
  share,
  getAvailablePlatforms,
  downloadImage,
  copyImageToClipboard,
  type SharePlatformConfig,
} from '../../lib/shareService';
import type {
  ShareCardType,
  WorkoutShareCardData,
  PRShareCardData,
  StreakShareCardData,
  AchievementShareCardData,
} from '@trainsmart/shared/types/social.types';

// ============================================================
// TYPES
// ============================================================

type ShareCardDataUnion =
  | WorkoutShareCardData
  | PRShareCardData
  | StreakShareCardData
  | AchievementShareCardData;

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardType: ShareCardType;
  cardData: ShareCardDataUnion;
  shareUrl?: string;
  shareText?: string;
}

// ============================================================
// ICON MAP
// ============================================================

const IconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Share2,
  Download,
  Copy,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
};

// ============================================================
// SHARE MODAL COMPONENT
// ============================================================

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  cardType,
  cardData,
  shareUrl,
  shareText = 'Guarda i miei risultati su TrainFlow! 💪',
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate image on mount
  useEffect(() => {
    if (isOpen && cardContainerRef.current && !generatedBlob) {
      generateImage();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGeneratedBlob(null);
      setCopied(false);
    }
  }, [isOpen]);

  const generateImage = useCallback(async () => {
    if (!cardContainerRef.current) return;

    setIsGenerating(true);
    try {
      // Small delay to ensure render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardContainerRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: 1080,
        height: 1920,
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });

      setGeneratedBlob(blob);
    } catch (error) {
      console.error('[ShareModal] Error generating image:', error);
      toast.error('Errore nella generazione dell\'immagine');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleShare = useCallback(
    async (platform: SharePlatformConfig) => {
      try {
        const result = await share({
          platform: platform.id,
          title: 'TrainFlow',
          text: shareText,
          url: shareUrl,
          imageBlob: generatedBlob || undefined,
        });

        if (result.success) {
          if (platform.id === 'copy') {
            setCopied(true);
            toast.success('Link copiato!');
            setTimeout(() => setCopied(false), 2000);
          } else if (platform.id === 'download') {
            toast.success('Immagine scaricata!');
          } else {
            toast.success(`Condiviso su ${platform.name}!`);
          }
        } else if (result.error && result.error !== 'Share cancelled') {
          toast.error(result.error);
        }
      } catch (error: any) {
        toast.error('Errore nella condivisione');
      }
    },
    [generatedBlob, shareText, shareUrl]
  );

  const handleDownload = useCallback(async () => {
    if (!generatedBlob) {
      await generateImage();
    }

    if (generatedBlob) {
      const filename = `trainflow-${cardType}-${Date.now()}.png`;
      downloadImage(generatedBlob, filename);
      toast.success('Immagine scaricata!');
    }
  }, [generatedBlob, cardType, generateImage]);

  const handleCopyImage = useCallback(async () => {
    if (!generatedBlob) {
      await generateImage();
    }

    if (generatedBlob) {
      const result = await copyImageToClipboard(generatedBlob);
      if (result.success) {
        setCopied(true);
        toast.success('Immagine copiata!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Impossibile copiare l\'immagine');
      }
    }
  }, [generatedBlob, generateImage]);

  // Get available platforms
  const platforms = getAvailablePlatforms(!!generatedBlob, !!shareUrl);

  // Render the appropriate card
  const renderCard = () => {
    switch (cardType) {
      case 'workout':
        return <WorkoutShareCard data={cardData as WorkoutShareCardData} />;
      case 'pr':
        return <PRShareCard data={cardData as PRShareCardData} />;
      case 'streak':
        return <StreakShareCard data={cardData as StreakShareCardData} />;
      case 'achievement':
        return <AchievementShareCard data={cardData as AchievementShareCardData} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Condividi</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Preview */}
            <div className="p-4 bg-slate-950">
              <div className="relative aspect-[9/16] max-h-[300px] mx-auto rounded-lg overflow-hidden shadow-2xl">
                {/* Hidden full-size card for generation */}
                <div
                  ref={cardContainerRef}
                  className="absolute"
                  style={{
                    width: '1080px',
                    height: '1920px',
                    transform: 'scale(0.15)',
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                  }}
                >
                  {renderCard()}
                </div>

                {/* Visible preview */}
                <div
                  className="w-full h-full"
                  style={{
                    transform: 'scale(0.15)',
                    transformOrigin: 'top left',
                  }}
                >
                  {renderCard()}
                </div>

                {/* Loading overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Share Buttons */}
            <div className="p-4 space-y-4">
              {/* Primary Actions */}
              <div className="grid grid-cols-4 gap-3">
                {platforms.slice(0, 4).map((platform) => {
                  const Icon = IconMap[platform.icon] || Share2;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform)}
                      disabled={isGenerating}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: platform.color }}
                      >
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className="text-xs text-slate-400">{platform.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Download size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-300">Scarica</span>
                </button>

                <button
                  onClick={handleCopyImage}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {copied ? (
                    <Check size={18} className="text-emerald-500" />
                  ) : (
                    <Copy size={18} className="text-slate-400" />
                  )}
                  <span className="text-sm text-slate-300">
                    {copied ? 'Copiato!' : 'Copia'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================
// EXPORTS
// ============================================================

export default ShareModal;
