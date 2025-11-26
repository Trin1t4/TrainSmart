import React, { useState, useRef, useEffect } from 'react';
import { getExerciseVideoUrl, checkVideoExists } from '../utils/exerciseVideos';
import ExerciseFormCuesOverlay from './ExerciseFormCuesOverlay';
import { Info } from 'lucide-react';

interface ExerciseVideoPlayerProps {
  exerciseName: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  showFormCues?: boolean; // Abilita form cues overlay
}

export default function ExerciseVideoPlayer({
  exerciseName,
  autoPlay = false,
  loop = true,
  muted = true,
  className = '',
  showFormCues = true
}: ExerciseVideoPlayerProps) {
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showCuesOverlay, setShowCuesOverlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = getExerciseVideoUrl(exerciseName);

  // Debug log
  console.log('[VIDEO] Exercise:', exerciseName, '-> URL:', videoUrl);

  // Check if video exists before rendering
  useEffect(() => {
    console.log('[VIDEO] Checking if video exists for:', exerciseName);
    checkVideoExists(exerciseName).then(exists => {
      console.log('[VIDEO] Video exists:', exists, 'for', exerciseName);
      setHasVideo(exists);
      if (!exists) {
        setIsLoading(false);
      }
    });
  }, [exerciseName]);

  // Don't render anything if video doesn't exist
  if (hasVideo === false) {
    return null;
  }

  // Show loading while checking
  if (hasVideo === null) {
    return null;
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
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 text-gray-600 mx-auto mb-2"
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
          <p className="text-gray-500 text-sm">Video non disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Play/Pause overlay */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
      >
        {!isPlaying && !isLoading && (
          <div className="bg-blue-500 rounded-full p-3 group-hover:scale-110 transition-transform">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </button>

      {/* Mute toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
          }
        }}
        className="absolute bottom-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {muted ? (
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          )}
        </svg>
      </button>

      {/* Form Cues Toggle (se abilitato) */}
      {showFormCues && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCuesOverlay(!showCuesOverlay);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            showCuesOverlay
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-black/50 hover:bg-black/70'
          }`}
          title="Mostra/Nascondi Form Cues"
        >
          <Info className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Form Cues Overlay */}
      {showFormCues && showCuesOverlay && (
        <ExerciseFormCuesOverlay
          exerciseName={exerciseName}
          showOnVideo={true}
        />
      )}
    </div>
  );
}
