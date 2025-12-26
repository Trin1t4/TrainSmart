/**
 * Supabase Edge Function: Hybrid Exercise Video Analysis
 *
 * Questa funzione supporta due modalità:
 * 1. INTERNAL: Riceve i landmark già estratti dal client e li analizza con il Biomechanics Engine
 * 2. GEMINI FALLBACK: Se i landmark non sono disponibili, usa Gemini 1.5 Pro
 *
 * Architettura:
 * Client → MediaPipe (browser) → Landmarks → Questa funzione → Biomechanics Engine → Feedback
 *                                    ↓ (se fallisce)
 *                            Video → Gemini 1.5 Pro → Feedback
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Gemini API config
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// ============================================
// BIOMECHANICS ENGINE (Simplified for Edge)
// ============================================

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface PoseLandmarks {
  left_shoulder: PoseLandmark;
  right_shoulder: PoseLandmark;
  left_hip: PoseLandmark;
  right_hip: PoseLandmark;
  left_knee: PoseLandmark;
  right_knee: PoseLandmark;
  left_ankle: PoseLandmark;
  right_ankle: PoseLandmark;
  left_elbow: PoseLandmark;
  right_elbow: PoseLandmark;
  left_wrist: PoseLandmark;
  right_wrist: PoseLandmark;
  left_heel: PoseLandmark;
  right_heel: PoseLandmark;
  left_foot_index: PoseLandmark;
  right_foot_index: PoseLandmark;
  [key: string]: PoseLandmark;
}

interface Issue {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp_seconds?: number[];
}

interface AnalysisResult {
  score: number;
  issues: Issue[];
  corrections: string[];
  warnings: string[];
  load_recommendation: string;
  sticking_point?: {
    detected: boolean;
    position?: string;
    angle?: number;
  };
  morphotype?: {
    type: string;
    note?: string;
  };
}

// Utility functions
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function distance(p1: PoseLandmark, p2: PoseLandmark): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow((p2.z || 0) - (p1.z || 0), 2)
  );
}

function midpoint(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: ((p1.z || 0) + (p2.z || 0)) / 2,
    visibility: Math.min(p1.visibility, p2.visibility)
  };
}

function calculateAngle(p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const cross = v1.x * v2.y - v1.y * v2.x;
  return toDegrees(Math.atan2(Math.abs(cross), dot));
}

function getKneeAngle(landmarks: PoseLandmarks, side: 'left' | 'right'): number {
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;
  const knee = side === 'left' ? landmarks.left_knee : landmarks.right_knee;
  const ankle = side === 'left' ? landmarks.left_ankle : landmarks.right_ankle;
  return calculateAngle(hip, knee, ankle);
}

function getHipAngle(landmarks: PoseLandmarks, side: 'left' | 'right'): number {
  const shoulder = side === 'left' ? landmarks.left_shoulder : landmarks.right_shoulder;
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;
  const knee = side === 'left' ? landmarks.left_knee : landmarks.right_knee;
  return calculateAngle(shoulder, hip, knee);
}

function getTorsoAngle(landmarks: PoseLandmarks): number {
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const dx = shoulderMid.x - hipMid.x;
  const dy = shoulderMid.y - hipMid.y;
  return toDegrees(Math.atan2(Math.abs(dx), Math.abs(dy)));
}

function getKneeValgus(landmarks: PoseLandmarks, side: 'left' | 'right'): number {
  const hip = side === 'left' ? landmarks.left_hip : landmarks.right_hip;
  const knee = side === 'left' ? landmarks.left_knee : landmarks.right_knee;
  const ankle = side === 'left' ? landmarks.left_ankle : landmarks.right_ankle;

  const expectedKneeX = hip.x + (ankle.x - hip.x) * ((knee.y - hip.y) / (ankle.y - hip.y));
  const deviation = knee.x - expectedKneeX;
  const kneeToAnkleDistance = Math.sqrt(Math.pow(knee.x - ankle.x, 2) + Math.pow(knee.y - ankle.y, 2));

  return toDegrees(Math.atan(deviation / kneeToAnkleDistance));
}

function classifyMorphotype(landmarks: PoseLandmarks): { type: string; note: string } {
  const femurLength = (distance(landmarks.left_hip, landmarks.left_knee) +
    distance(landmarks.right_hip, landmarks.right_knee)) / 2;
  const tibiaLength = (distance(landmarks.left_knee, landmarks.left_ankle) +
    distance(landmarks.right_knee, landmarks.right_ankle)) / 2;
  const hipMid = midpoint(landmarks.left_hip, landmarks.right_hip);
  const shoulderMid = midpoint(landmarks.left_shoulder, landmarks.right_shoulder);
  const torsoLength = distance(hipMid, shoulderMid);

  const femurToTorso = femurLength / torsoLength;

  if (femurToTorso > 1.1) {
    return {
      type: 'LONG_FEMUR',
      note: 'Con femori lunghi, una maggiore inclinazione del torso è normale e non un errore.'
    };
  }
  if (femurToTorso < 0.9) {
    return {
      type: 'LONG_TORSO',
      note: 'Con un torso lungo puoi mantenere una posizione più verticale nello squat.'
    };
  }
  return {
    type: 'BALANCED',
    note: 'Proporzioni bilanciate - puoi adattarti bene a diversi stili.'
  };
}

/**
 * Analizza una sequenza di frame per squat
 */
function analyzeSquatSequence(frameSequence: PoseLandmarks[]): AnalysisResult {
  const issues: Issue[] = [];
  const corrections: string[] = [];
  const warnings: string[] = [];

  // Calcola angoli medi e minimi
  let minKneeAngle = 180;
  let maxTorsoAngle = 0;
  let maxValgus = 0;
  let bottomFrameIndex = 0;

  // Find the bottom position (minimum knee angle)
  frameSequence.forEach((frame, idx) => {
    const kneeAngle = (getKneeAngle(frame, 'left') + getKneeAngle(frame, 'right')) / 2;
    if (kneeAngle < minKneeAngle) {
      minKneeAngle = kneeAngle;
      bottomFrameIndex = idx;
    }
  });

  // Analyze frames
  let spineIssueCount = 0;
  let heelRiseCount = 0;
  let valgusFrames: number[] = [];

  frameSequence.forEach((frame, idx) => {
    const kneeAngle = (getKneeAngle(frame, 'left') + getKneeAngle(frame, 'right')) / 2;
    const torsoAngle = getTorsoAngle(frame);
    const valgus = (getKneeValgus(frame, 'left') + getKneeValgus(frame, 'right')) / 2;

    if (torsoAngle > maxTorsoAngle) maxTorsoAngle = torsoAngle;
    if (Math.abs(valgus) > maxValgus) maxValgus = Math.abs(valgus);

    // Check for knee valgus
    if (Math.abs(valgus) > 10) {
      valgusFrames.push(idx);
    }

    // Check for heel rise
    if (frame.left_heel.y < frame.left_foot_index.y - 0.02 ||
        frame.right_heel.y < frame.right_foot_index.y - 0.02) {
      heelRiseCount++;
    }
  });

  // Get morphotype
  const morphotype = classifyMorphotype(frameSequence[0]);

  // Generate issues
  if (maxValgus > 10) {
    issues.push({
      name: 'KNEE_VALGUS',
      severity: maxValgus > 15 ? 'high' : 'medium',
      description: 'Le ginocchia tendono a collassare verso l\'interno durante il movimento',
      timestamp_seconds: valgusFrames.map(f => f / 10) // Assuming 10fps
    });
    warnings.push('⚠️ Valgismo del ginocchio rilevato - rischio per i legamenti');
    corrections.push('Spingi le ginocchia verso l\'esterno, in linea con le punte dei piedi');
    corrections.push('Rinforza i glutei con esercizi come clamshell e lateral band walk');
  }

  if (maxTorsoAngle > (morphotype.type === 'LONG_FEMUR' ? 65 : 55)) {
    issues.push({
      name: 'EXCESSIVE_FORWARD_LEAN',
      severity: 'medium',
      description: 'Inclinazione del torso eccessiva durante la discesa'
    });
    corrections.push('Mantieni il petto alto e il core attivo');
    corrections.push('Prova il front squat per migliorare la posizione verticale');
  }

  if (heelRiseCount > frameSequence.length * 0.2) {
    issues.push({
      name: 'HEEL_RISE',
      severity: 'medium',
      description: 'I talloni tendono ad alzarsi durante il movimento'
    });
    corrections.push('Lavora sulla mobilità della caviglia');
    corrections.push('Prova con un rialzo sotto i talloni o scarpe da squat');
  }

  if (minKneeAngle > 100) {
    issues.push({
      name: 'INSUFFICIENT_DEPTH',
      severity: 'low',
      description: 'La profondità dello squat potrebbe essere maggiore'
    });
    corrections.push('Scendi fino a quando la piega dell\'anca è sotto il ginocchio');
  }

  // Calculate score
  let score = 10;
  issues.forEach(issue => {
    if (issue.severity === 'high') score -= 2;
    else if (issue.severity === 'medium') score -= 1.5;
    else score -= 0.5;
  });
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  // Determine sticking point
  const sticking_point = {
    detected: false as boolean,
    position: undefined as string | undefined,
    angle: undefined as number | undefined
  };

  // Analyze velocity changes to detect sticking point
  // (simplified - in production would use actual velocity calculations)
  if (minKneeAngle < 100) {
    sticking_point.detected = true;
    sticking_point.position = 'BOTTOM';
    sticking_point.angle = minKneeAngle;
  }

  // Load recommendation
  let load_recommendation = 'maintain';
  if (issues.filter(i => i.severity === 'high').length >= 2) {
    load_recommendation = 'decrease_20_percent';
  } else if (issues.filter(i => i.severity === 'high').length >= 1) {
    load_recommendation = 'decrease_10_percent';
  } else if (score >= 8 && issues.length === 0) {
    load_recommendation = 'increase_5_percent';
  }

  return {
    score,
    issues,
    corrections: corrections.slice(0, 3),
    warnings,
    load_recommendation,
    sticking_point: sticking_point.detected ? sticking_point : undefined,
    morphotype
  };
}

/**
 * Analizza una sequenza di frame per deadlift
 */
function analyzeDeadliftSequence(frameSequence: PoseLandmarks[], style: 'conventional' | 'sumo'): AnalysisResult {
  const issues: Issue[] = [];
  const corrections: string[] = [];
  const warnings: string[] = [];

  let maxTorsoAngle = 0;
  let spineRoundingDetected = false;

  frameSequence.forEach((frame) => {
    const torsoAngle = getTorsoAngle(frame);
    if (torsoAngle > maxTorsoAngle) maxTorsoAngle = torsoAngle;

    // Check for spine rounding (simplified)
    if (torsoAngle > 70) {
      spineRoundingDetected = true;
    }
  });

  const morphotype = classifyMorphotype(frameSequence[0]);

  if (spineRoundingDetected) {
    issues.push({
      name: 'SPINE_ROUNDING',
      severity: 'high',
      description: 'La colonna lombare perde la neutralità durante il movimento'
    });
    warnings.push('⚠️ Schiena arrotondata rilevata - rischio per la colonna vertebrale');
    corrections.push('Mantieni la schiena piatta e il core contratto');
    corrections.push('Riduci il carico e lavora sulla tecnica');
  }

  if (style === 'conventional' && maxTorsoAngle < 30) {
    issues.push({
      name: 'HIP_TOO_LOW',
      severity: 'medium',
      description: 'Le anche partono troppo basse - stai "squattando" lo stacco'
    });
    corrections.push('Le anche devono partire più alte delle ginocchia');
    corrections.push('Pensa a spingere il pavimento con i piedi');
  }

  let score = 10;
  issues.forEach(issue => {
    if (issue.severity === 'high') score -= 2;
    else if (issue.severity === 'medium') score -= 1.5;
    else score -= 0.5;
  });
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  let load_recommendation = 'maintain';
  if (issues.filter(i => i.severity === 'high').length >= 1) {
    load_recommendation = 'decrease_20_percent';
  }

  return {
    score,
    issues,
    corrections: corrections.slice(0, 3),
    warnings,
    load_recommendation,
    morphotype
  };
}

/**
 * Analizza una sequenza di frame per bench press
 */
function analyzeBenchSequence(frameSequence: PoseLandmarks[]): AnalysisResult {
  const issues: Issue[] = [];
  const corrections: string[] = [];
  const warnings: string[] = [];

  let maxElbowFlare = 0;

  frameSequence.forEach((frame) => {
    // Check elbow angle relative to body
    const shoulderMid = midpoint(frame.left_shoulder, frame.right_shoulder);
    const leftElbowAngle = calculateAngle(frame.left_shoulder, frame.left_elbow, frame.left_wrist);
    const rightElbowAngle = calculateAngle(frame.right_shoulder, frame.right_elbow, frame.right_wrist);

    // Simplified elbow flare detection
    const elbowFlare = 90 - ((leftElbowAngle + rightElbowAngle) / 2);
    if (Math.abs(elbowFlare) > maxElbowFlare) maxElbowFlare = Math.abs(elbowFlare);
  });

  if (maxElbowFlare > 30) {
    issues.push({
      name: 'ELBOW_FLARE',
      severity: 'medium',
      description: 'I gomiti si aprono troppo (oltre 75° dal corpo)'
    });
    warnings.push('⚠️ Gomiti troppo aperti - stress sulla spalla');
    corrections.push('Mantieni i gomiti a 45-60° dal corpo');
    corrections.push('Pensa a "piegare la barra" verso di te');
  }

  const morphotype = classifyMorphotype(frameSequence[0]);

  let score = 10;
  issues.forEach(issue => {
    if (issue.severity === 'high') score -= 2;
    else if (issue.severity === 'medium') score -= 1.5;
    else score -= 0.5;
  });
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  return {
    score,
    issues,
    corrections: corrections.slice(0, 3),
    warnings,
    load_recommendation: issues.length > 0 ? 'maintain' : 'increase_5_percent',
    morphotype
  };
}

/**
 * Router per l'analisi in base all'esercizio
 */
function analyzeFrameSequence(
  frameSequence: PoseLandmarks[],
  exercise: string
): AnalysisResult {
  const normalizedExercise = exercise.toLowerCase();

  if (normalizedExercise.includes('squat')) {
    return analyzeSquatSequence(frameSequence);
  }
  if (normalizedExercise.includes('deadlift') || normalizedExercise.includes('stacco')) {
    const style = normalizedExercise.includes('sumo') ? 'sumo' : 'conventional';
    return analyzeDeadliftSequence(frameSequence, style);
  }
  if (normalizedExercise.includes('bench') || normalizedExercise.includes('panca')) {
    return analyzeBenchSequence(frameSequence);
  }

  // Default analysis
  return analyzeSquatSequence(frameSequence);
}

// ============================================
// GEMINI FALLBACK
// ============================================

function getGeminiPrompt(exerciseName: string): string {
  return `Sei un preparatore atletico esperto con 15 anni di esperienza nell'analisi della tecnica degli esercizi.

Analizza questo video di ${exerciseName} e fornisci feedback biomeccanico dettagliato IN ITALIANO.

**Focus dell'Analisi:**
1. **Allineamento Articolare** - Verifica allineamento corretto di ginocchia, anche, spalle, colonna
2. **Range of Motion** - Valuta profondità, traiettoria, simmetria del movimento
3. **Tempo e Controllo** - Valuta fasi eccentrica/concentrica, stabilità
4. **Rischi per la Sicurezza** - Rileva pattern che aumentano il rischio infortuni

**Formato Output:**
Restituisci l'analisi come JSON valido (no markdown, no code blocks):
{
  "overall_score": <numero 1-10>,
  "issues": [
    {
      "name": "<identificatore_problema>",
      "severity": "low|medium|high",
      "description": "<osservazione dettagliata IN ITALIANO>"
    }
  ],
  "corrections": [
    "<cue correttiva specifica IN ITALIANO 1>",
    "<cue correttiva specifica IN ITALIANO 2>"
  ],
  "safety_warnings": [
    "<avviso se rilevato rischio infortunio IN ITALIANO>"
  ],
  "load_recommendation": "increase_5_percent|maintain|decrease_10_percent|decrease_20_percent"
}

Sii specifico, azionabile e incoraggiante. RISPONDI SEMPRE IN ITALIANO.`;
}

async function callGemini(videoBase64: string, exerciseName: string): Promise<AnalysisResult> {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: getGeminiPrompt(exerciseName) },
          { inline_data: { mime_type: "video/mp4", data: videoBase64 } }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const feedbackText = data.candidates[0].content.parts[0].text;

  // Extract JSON from response
  const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in Gemini response");
  }

  const feedback = JSON.parse(jsonMatch[0]);

  return {
    score: feedback.overall_score,
    issues: feedback.issues || [],
    corrections: feedback.corrections || [],
    warnings: feedback.safety_warnings || [],
    load_recommendation: feedback.load_recommendation || 'maintain'
  };
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  try {
    const body = await req.json();
    const {
      frame_sequence,      // Array di PoseLandmarks (se disponibile)
      video_url,          // URL del video in storage (per fallback Gemini)
      exercise_name,
      user_id,
      correction_id,
      use_gemini = false  // Forza Gemini
    } = body;

    console.log(`[Hybrid] Processing for user ${user_id}, exercise: ${exercise_name}`);
    console.log(`[Hybrid] Mode: ${frame_sequence ? 'INTERNAL' : 'GEMINI'}`);

    // Update status
    await supabase
      .from("video_corrections")
      .update({
        processing_status: "processing",
        ai_model_used: frame_sequence ? "internal-biomechanics" : "gemini-1.5-pro"
      })
      .eq("id", correction_id);

    let result: AnalysisResult;

    // ============================================
    // INTERNAL ANALYSIS (with landmarks)
    // ============================================
    if (frame_sequence && frame_sequence.length > 0 && !use_gemini) {
      console.log(`[Hybrid] Using internal engine with ${frame_sequence.length} frames`);

      try {
        result = analyzeFrameSequence(frame_sequence, exercise_name);
        console.log(`[Hybrid] Internal analysis complete, score: ${result.score}`);
      } catch (error) {
        console.error("[Hybrid] Internal analysis failed, falling back to Gemini:", error);

        // Fallback to Gemini
        if (video_url) {
          const { data: videoBlob } = await supabase.storage
            .from("user-exercise-videos")
            .download(video_url);

          if (videoBlob) {
            const arrayBuffer = await videoBlob.arrayBuffer();
            const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            result = await callGemini(videoBase64, exercise_name);
          } else {
            throw new Error("Video not found for Gemini fallback");
          }
        } else {
          throw error;
        }
      }
    }
    // ============================================
    // GEMINI ANALYSIS (fallback)
    // ============================================
    else if (video_url) {
      console.log(`[Hybrid] Using Gemini fallback`);

      const { data: videoBlob, error: downloadError } = await supabase.storage
        .from("user-exercise-videos")
        .download(video_url);

      if (downloadError || !videoBlob) {
        throw new Error(`Storage download failed: ${downloadError?.message || 'Video not found'}`);
      }

      const arrayBuffer = await videoBlob.arrayBuffer();
      const videoBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      result = await callGemini(videoBase64, exercise_name);
      console.log(`[Hybrid] Gemini analysis complete, score: ${result.score}`);
    } else {
      throw new Error("Neither frame_sequence nor video_url provided");
    }

    // Save to database
    const { error: updateError } = await supabase
      .from("video_corrections")
      .update({
        processing_status: "completed",
        feedback_score: result.score,
        feedback_issues: result.issues,
        feedback_corrections: result.corrections,
        feedback_warnings: result.warnings,
        load_recommendation: result.load_recommendation,
        processed_at: new Date().toISOString(),
        metadata: {
          sticking_point: result.sticking_point,
          morphotype: result.morphotype
        }
      })
      .eq("id", correction_id);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    // Increment quota
    await supabase.rpc("increment_video_correction_usage", { p_user_id: user_id });

    console.log(`[Hybrid] ✅ Processing completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        correction_id,
        source: frame_sequence ? 'internal' : 'gemini',
        feedback: {
          score: result.score,
          issues_count: result.issues.length,
          has_warnings: result.warnings.length > 0
        }
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );

  } catch (error) {
    console.error(`[Hybrid] ❌ Error:`, error);

    // Update status to failed
    try {
      const body = await req.clone().json();
      if (body.correction_id) {
        await supabase
          .from("video_corrections")
          .update({
            processing_status: "failed",
            metadata: { error: error.message }
          })
          .eq("id", body.correction_id);
      }
    } catch (e) {
      console.error("[Hybrid] Failed to update error status");
    }

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
