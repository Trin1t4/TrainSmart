/**
 * Screening Video Player
 * Video player specifico per dimostrazioni test funzionali screening
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface ScreeningVideoPlayerProps {
  videoRef: string; // es. 'neck_flexion_test', 'neer_test', etc.
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  showControls?: boolean;
}

// URL base per i video di screening su Supabase Storage
const SUPABASE_SCREENING_VIDEOS_URL =
  'https://mhcdxqhhlrujbjxtgnmz.supabase.co/storage/v1/object/public/screening-videos';

/**
 * Converte video_ref in nome file
 * 'neck_flexion_test' -> 'neck-flexion-test.mp4'
 */
function getScreeningVideoUrl(videoRef: string): string {
  const fileName = videoRef.replace(/_/g, '-') + '.mp4';
  return `${SUPABASE_SCREENING_VIDEOS_URL}/${fileName}`;
}

export default function ScreeningVideoPlayer({
  videoRef,
  autoPlay = false,
  loop = true,
  className = '',
  showControls = true
}: ScreeningVideoPlayerProps) {
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true); // Default muted
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const videoUrl = getScreeningVideoUrl(videoRef);

  // Check if video exists
  useEffect(() => {
    const checkVideo = async () => {
      try {
        const response = await fetch(videoUrl, { method: 'HEAD' });
        setHasVideo(response.ok);
        if (!response.ok) {
          setIsLoading(false);
        }
      } catch {
        setHasVideo(false);
        setIsLoading(false);
      }
    };

    checkVideo();
  }, [videoUrl]);

  // Don't render if video doesn't exist
  if (hasVideo === false) {
    return (
      <div className={`bg-slate-800 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <svg
            className="w-16 h-16 text-slate-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-slate-400 text-sm">Video demo coming soon</p>
          <p className="text-slate-500 text-xs mt-1">({videoRef})</p>
        </div>
      </div>
    );
  }

  // Show loading while checking
  if (hasVideo === null) {
    return (
      <div className={`bg-slate-800 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const togglePlay = () => {
    if (videoElementRef.current) {
      if (isPlaying) {
        videoElementRef.current.pause();
      } else {
        videoElementRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoElementRef.current) {
      videoElementRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoElementRef.current) {
      videoElementRef.current.currentTime = 0;
      videoElementRef.current.play();
      setIsPlaying(true);
    }
  };

  if (hasError) {
    return (
      <div className={`bg-slate-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-slate-600 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-slate-400 text-sm">Video error</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-900 rounded-lg overflow-hidden ${className}`}>
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoElementRef}
        src={videoUrl}
        autoPlay={autoPlay}
        loop={loop}
        muted={isMuted}
        playsInline
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Controls Overlay */}
      {showControls && (
        <>
          {/* Play/Pause overlay (click anywhere) */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {!isPlaying && !isLoading && (
              <div className="bg-blue-500 rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
                <Play className="w-8 h-8 text-white fill-white" />
              </div>
            )}
          </button>

          {/* Control Buttons */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white" />
                )}
              </button>

              {/* Restart button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restartVideo();
                }}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Restart video"
              >
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Mute toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors backdrop-blur-sm"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Test Label */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="text-white text-sm font-medium">Test Demo</span>
      </div>
    </div>
  );
}
