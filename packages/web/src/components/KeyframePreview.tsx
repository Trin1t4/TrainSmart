/**
 * Keyframe Preview - Canvas statico per visualizzare snapshot di errori
 * Mostra lo screenshot del frame video come sfondo + skeleton overlay
 */

import React, { useRef, useEffect } from 'react';
import type { FrameLandmarkSnapshot } from '@/lib/biomechanics/types';
import { PoseOverlayRenderer } from '@/lib/biomechanics/poseOverlayRenderer';

interface KeyframePreviewProps {
  snapshot: FrameLandmarkSnapshot;
  width?: number;
  height?: number;
}

export default function KeyframePreview({ 
  snapshot, 
  width = 320, 
  height = 240 
}: KeyframePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new PoseOverlayRenderer(ctx, width, height);

    if (snapshot.frameImage) {
      // Disegna prima il frame video come sfondo, poi lo skeleton sopra
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        renderer.renderFrame(snapshot);
      };
      img.onerror = () => {
        // Se l'immagine non carica, disegna solo lo skeleton su sfondo grigio
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);
        renderer.renderFrame(snapshot);
      };
      img.src = snapshot.frameImage;
    } else {
      // Nessun frameImage: disegna solo skeleton su sfondo grigio
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, width, height);
      renderer.renderFrame(snapshot);
    }
  }, [snapshot, width, height]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border border-gray-700"
      />
      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
        Frame {snapshot.frameNumber} @ {snapshot.timestamp.toFixed(1)}s
      </div>
      {snapshot.status === 'correct' && (
        <div className="absolute top-2 right-2 bg-green-600/90 px-2 py-1 rounded text-xs text-white font-bold">
          ✓ CORRETTO
        </div>
      )}
      {snapshot.status === 'error' && snapshot.issues.length > 0 && (
        <div className="absolute top-2 right-2 bg-red-600/90 px-2 py-1 rounded text-xs text-white font-bold">
          ⚠ {snapshot.issues.length} {snapshot.issues.length === 1 ? 'ERRORE' : 'ERRORI'}
        </div>
      )}
    </div>
  );
}
