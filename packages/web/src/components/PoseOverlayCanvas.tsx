/**
 * PoseOverlayCanvas
 * Canvas overlay sincronizzato con il video per mostrare le correzioni grafiche.
 *
 * - Posizionato absolute sopra il <video>
 * - Sincronizza con timeupdate + requestAnimationFrame
 * - Trova il frame landmark piu' vicino al currentTime
 * - Pulisce il canvas quando non ci sono issues
 */

import React, { useRef, useEffect, useCallback } from 'react';
import type { FrameLandmarkSnapshot } from '@/lib/biomechanics/types';
import { PoseOverlayRenderer } from '@/lib/biomechanics/poseOverlayRenderer';

interface PoseOverlayCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarks: FrameLandmarkSnapshot[];
  fps: number;
  enabled: boolean;
}

export default function PoseOverlayCanvas({
  videoRef,
  landmarks,
  fps,
  enabled,
}: PoseOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PoseOverlayRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(-1);

  // Trova il frame landmark piu' vicino al timestamp
  const findClosestSnapshot = useCallback(
    (currentTime: number): FrameLandmarkSnapshot | null => {
      if (landmarks.length === 0) return null;

      let closest: FrameLandmarkSnapshot | null = null;
      let minDelta = Infinity;

      for (const snap of landmarks) {
        const delta = Math.abs(snap.timestamp - currentTime);
        if (delta < minDelta) {
          minDelta = delta;
          closest = snap;
        }
      }

      // Overlay visibile ±0.5s attorno a ciascun keyframe
      const tolerance = 0.5;
      return minDelta <= tolerance ? closest : null;
    },
    [landmarks, fps]
  );

  // Sync canvas size con il video
  const syncSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const rect = video.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      rendererRef.current = new PoseOverlayRenderer(ctx, rect.width, rect.height);
    }
  }, [videoRef]);

  // Render loop
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const renderer = rendererRef.current;

    if (!video || !renderer || !enabled) {
      renderer?.clear();
      return;
    }

    const snapshot = findClosestSnapshot(video.currentTime);

    if (snapshot) {
      if (snapshot.frameNumber !== lastFrameRef.current) {
        renderer.renderFrame(snapshot);
        lastFrameRef.current = snapshot.frameNumber;
      }
    } else {
      if (lastFrameRef.current !== -1) {
        renderer.clear();
        lastFrameRef.current = -1;
      }
    }
  }, [videoRef, enabled, findClosestSnapshot]);

  // Setup event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    syncSize();

    const onTimeUpdate = () => {
      renderLoop();
    };

    const onSeeked = () => {
      lastFrameRef.current = -1;
      renderLoop();
    };

    const onPlay = () => {
      const tick = () => {
        renderLoop();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
      lastFrameRef.current = -1;
      renderLoop();
    });
    resizeObserver.observe(video);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      resizeObserver.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [videoRef, syncSize, renderLoop]);

  // Pulisci se disabilitato
  useEffect(() => {
    if (!enabled) {
      rendererRef.current?.clear();
      lastFrameRef.current = -1;
    }
  }, [enabled]);

  if (!enabled || landmarks.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
}
