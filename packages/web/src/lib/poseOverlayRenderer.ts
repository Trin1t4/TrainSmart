/**
 * Pose Overlay Renderer
 * Disegna segmenti rossi (errore) e verdi (correzione) su un canvas 2D sovrapposto al video.
 *
 * - Rosso (continuo, 4px, glow) = posizione attuale sbagliata
 * - Verde (tratteggiato, 3px, glow) = posizione corretta suggerita
 * - Cerchi evidenziati sui punti problematici
 */

import type { PoseLandmarks, FrameLandmarkSnapshot } from '@trainsmart/shared';
import {
  getIssueSegmentMap,
  getVisibleSegments,
  isLandmarkVisible,
  type SegmentDefinition,
  type LandmarkKey,
} from '@trainsmart/shared';
import { calculateCorrectedSegments, type CorrectedSegment, type Point2D } from './correctionCalculator';

// ============================================
// CONFIG
// ============================================

const ERROR_COLOR = 'rgba(239, 68, 68, 0.9)';     // red-500
const ERROR_GLOW = 'rgba(239, 68, 68, 0.4)';
const CORRECT_COLOR = 'rgba(34, 197, 94, 0.9)';    // green-500
const CORRECT_GLOW = 'rgba(34, 197, 94, 0.4)';
const POINT_COLOR = 'rgba(239, 68, 68, 1)';
const POINT_RING_COLOR = 'rgba(255, 255, 255, 0.6)';

const ERROR_LINE_WIDTH = 4;
const CORRECT_LINE_WIDTH = 3;
const CORRECT_DASH = [8, 6];
const POINT_RADIUS = 6;
const POINT_RING_RADIUS = 9;
const GLOW_BLUR = 8;
const VISIBILITY_THRESHOLD = 0.4;

// ============================================
// RENDERER CLASS
// ============================================

export class PoseOverlayRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Pulisce il canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Renderizza un frame con le overlay di correzione
   */
  renderFrame(snapshot: FrameLandmarkSnapshot) {
    this.clear();

    const { landmarks, issues } = snapshot;
    if (!issues || issues.length === 0) return;

    // Per ogni issue, disegna segmenti rossi e verdi
    for (const issue of issues) {
      const mapping = getIssueSegmentMap(issue.code);
      if (!mapping) continue;

      // Filtra segmenti visibili
      const visibleErrorSegments = getVisibleSegments(
        mapping.errorSegments,
        landmarks,
        VISIBILITY_THRESHOLD
      );

      // Disegna segmenti rossi (errore attuale)
      this.drawErrorSegments(visibleErrorSegments, landmarks);

      // Disegna punti problematici
      this.drawErrorPoints(mapping.errorPoints, landmarks);

      // Calcola e disegna segmenti verdi (correzione)
      const correctedSegments = calculateCorrectedSegments(mapping, landmarks);
      if (correctedSegments) {
        this.drawCorrectedSegments(correctedSegments);
      }
    }
  }

  // ============================================
  // DRAWING METHODS
  // ============================================

  private drawErrorSegments(segments: SegmentDefinition[], landmarks: PoseLandmarks) {
    this.ctx.save();
    this.ctx.strokeStyle = ERROR_COLOR;
    this.ctx.lineWidth = ERROR_LINE_WIDTH;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = ERROR_GLOW;
    this.ctx.shadowBlur = GLOW_BLUR;
    this.ctx.setLineDash([]);

    for (const seg of segments) {
      const from = landmarks[seg.from];
      const to = landmarks[seg.to];

      this.ctx.beginPath();
      this.ctx.moveTo(from.x * this.width, from.y * this.height);
      this.ctx.lineTo(to.x * this.width, to.y * this.height);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawCorrectedSegments(segments: CorrectedSegment[]) {
    this.ctx.save();
    this.ctx.strokeStyle = CORRECT_COLOR;
    this.ctx.lineWidth = CORRECT_LINE_WIDTH;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = CORRECT_GLOW;
    this.ctx.shadowBlur = GLOW_BLUR;
    this.ctx.setLineDash(CORRECT_DASH);

    for (const seg of segments) {
      this.ctx.beginPath();
      this.ctx.moveTo(seg.from.x * this.width, seg.from.y * this.height);
      this.ctx.lineTo(seg.to.x * this.width, seg.to.y * this.height);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawErrorPoints(points: LandmarkKey[], landmarks: PoseLandmarks) {
    this.ctx.save();

    for (const key of points) {
      const landmark = landmarks[key];
      if (!isLandmarkVisible(landmark, VISIBILITY_THRESHOLD)) continue;

      const px = landmark.x * this.width;
      const py = landmark.y * this.height;

      // Anello bianco esterno
      this.ctx.beginPath();
      this.ctx.arc(px, py, POINT_RING_RADIUS, 0, Math.PI * 2);
      this.ctx.strokeStyle = POINT_RING_COLOR;
      this.ctx.lineWidth = 2;
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
      this.ctx.stroke();

      // Cerchio rosso pieno
      this.ctx.beginPath();
      this.ctx.arc(px, py, POINT_RADIUS, 0, Math.PI * 2);
      this.ctx.fillStyle = POINT_COLOR;
      this.ctx.shadowColor = ERROR_GLOW;
      this.ctx.shadowBlur = GLOW_BLUR;
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
