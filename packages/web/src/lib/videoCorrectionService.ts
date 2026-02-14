/**
 * Video Correction Service
 * Gestisce upload video, quota, e feedback AI
 */

import { supabase } from './supabaseClient';

export interface VideoCorrection {
  id: string;
  user_id: string;
  video_url: string;
  video_filename: string;
  exercise_name: string;
  exercise_pattern?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  feedback_score?: number;
  feedback_issues?: FeedbackIssue[];
  feedback_corrections?: string[];
  feedback_warnings?: string[];
  load_recommendation?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  processed_at?: string;
  viewed_at?: string;
}

export interface FeedbackIssue {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp_seconds?: number[];
}

export interface QuotaInfo {
  can_upload: boolean;
  tier: 'free' | 'base' | 'pro' | 'premium';
  used: number;
  max_allowed: number;
  remaining: number;
  reset_date: string;
  days_until_reset: number;
}

/**
 * Check video correction quota for user
 */
export async function checkVideoQuota(userId: string): Promise<QuotaInfo | null> {
  try {
    console.log('[VideoCorrectionService] Checking quota for user:', userId);

    const { data, error } = await supabase
      .rpc('check_video_correction_quota', { p_user_id: userId });

    if (error) {
      console.error('[VideoCorrectionService] Quota check error:', error);
      throw error;
    }

    console.log('[VideoCorrectionService] Quota info:', data);
    return data as QuotaInfo;
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to check quota:', error);
    return null;
  }
}

/**
 * Upload video and create correction record
 */
export async function uploadExerciseVideo(
  userId: string,
  videoFile: File,
  exerciseName: string,
  exercisePattern?: string,
  workoutLogId?: string,
  setNumber?: number
): Promise<{ success: boolean; correctionId?: string; error?: string }> {
  try {
    console.log('[VideoCorrectionService] Starting upload for:', exerciseName);

    // 1. Check quota first
    const quota = await checkVideoQuota(userId);
    if (!quota || !quota.can_upload) {
      return {
        success: false,
        error: quota
          ? `Hai raggiunto il limite di ${quota.max_allowed} video per il tuo piano ${quota.tier}`
          : 'Impossibile verificare quota. Riprova.'
      };
    }

    // 2. Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const randomId = Math.random().toString(36).substring(7);
    const exerciseSlug = exerciseName.toLowerCase().replace(/\s+/g, '-');
    const filename = `${timestamp}_${exerciseSlug}_${randomId}.mp4`;
    const filePath = `${userId}/${filename}`;

    console.log('[VideoCorrectionService] Uploading to storage:', filePath);

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-exercise-videos')
      .upload(filePath, videoFile, {
        contentType: videoFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('[VideoCorrectionService] Upload error:', uploadError);
      throw new Error(`Upload fallito: ${uploadError.message}`);
    }

    console.log('[VideoCorrectionService] Upload successful:', uploadData.path);

    // 4. Create video_corrections record
    const { data: correctionData, error: insertError } = await supabase
      .from('video_corrections')
      .insert({
        user_id: userId,
        video_url: uploadData.path,
        video_filename: filename,
        video_size_bytes: videoFile.size,
        exercise_name: exerciseName,
        exercise_pattern: exercisePattern,
        workout_log_id: workoutLogId,
        set_number: setNumber,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('[VideoCorrectionService] Insert error:', insertError);
      // Cleanup uploaded video
      await supabase.storage.from('user-exercise-videos').remove([filePath]);
      throw new Error(`Creazione record fallita: ${insertError.message}`);
    }

    console.log('[VideoCorrectionService] Record created:', correctionData.id);

    // 5. Trigger Edge Function to process video
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const edgeFunctionUrl = `${supabase.supabaseUrl}/functions/v1/analyze-exercise-video`;

    console.log('[VideoCorrectionService] Calling Edge Function:', edgeFunctionUrl);

    // Fire and forget - non aspettiamo la risposta
    fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        video_url: uploadData.path,
        exercise_name: exerciseName,
        user_id: userId,
        correction_id: correctionData.id
      })
    }).catch(err => {
      console.error('[VideoCorrectionService] Edge Function call failed:', err);
    });

    console.log('[VideoCorrectionService] ✅ Upload complete, processing started');

    return {
      success: true,
      correctionId: correctionData.id
    };

  } catch (error) {
    console.error('[VideoCorrectionService] Upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload fallito'
    };
  }
}

/**
 * Get all video corrections for user
 */
export async function getUserVideoCorrections(userId: string): Promise<VideoCorrection[]> {
  try {
    const { data, error } = await supabase
      .from('video_corrections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as VideoCorrection[];
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to fetch corrections:', error);
    return [];
  }
}

/**
 * Get single video correction by ID
 */
export async function getVideoCorrection(correctionId: string): Promise<VideoCorrection | null> {
  try {
    const { data, error } = await supabase
      .from('video_corrections')
      .select('*')
      .eq('id', correctionId)
      .single();

    if (error) throw error;

    return data as VideoCorrection;
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to fetch correction:', error);
    return null;
  }
}

/**
 * Mark video correction as viewed
 */
export async function markVideoAsViewed(correctionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('video_corrections')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', correctionId)
      .is('viewed_at', null); // Only update if not already viewed

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to mark as viewed:', error);
    return false;
  }
}

/**
 * Delete video correction
 */
export async function deleteVideoCorrection(correctionId: string, videoUrl: string): Promise<boolean> {
  try {
    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage
      .from('user-exercise-videos')
      .remove([videoUrl]);

    if (storageError) {
      console.error('[VideoCorrectionService] Storage delete error:', storageError);
    }

    // 2. Delete database record
    const { error: dbError } = await supabase
      .from('video_corrections')
      .delete()
      .eq('id', correctionId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to delete correction:', error);
    return false;
  }
}

/**
 * Get signed URL for video playback
 */
export async function getVideoSignedUrl(videoUrl: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('user-exercise-videos')
      .createSignedUrl(videoUrl, expiresIn);

    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error('[VideoCorrectionService] Failed to get signed URL:', error);
    return null;
  }
}

/**
 * Poll for processing completion
 * Useful per mostrare feedback real-time
 */
export async function pollProcessingStatus(
  correctionId: string,
  onStatusChange: (status: string, correction?: VideoCorrection) => void,
  maxAttempts: number = 60, // 60 attempts × 2s = 2 minutes max
  intervalMs: number = 2000
): Promise<void> {
  let attempts = 0;

  const pollInterval = setInterval(async () => {
    attempts++;

    const correction = await getVideoCorrection(correctionId);

    if (!correction) {
      clearInterval(pollInterval);
      onStatusChange('failed');
      return;
    }

    onStatusChange(correction.processing_status, correction);

    // Stop polling se completato, fallito, o max attempts
    if (
      correction.processing_status === 'completed' ||
      correction.processing_status === 'failed' ||
      attempts >= maxAttempts
    ) {
      clearInterval(pollInterval);
    }
  }, intervalMs);
}

/**
 * Get user tier-specific limits
 */
export function getTierLimits(tier: string): {
  videosPerCycle: number;
  cyclePrice: string;
  features: string[];
} {
  const tiers = {
    free: {
      videosPerCycle: 1,
      cyclePrice: '€0',
      features: ['1 video correzione gratis', 'Demo delle features premium']
    },
    base: {
      videosPerCycle: 0,
      cyclePrice: '€12.90',
      features: ['Programma completo 6 settimane', 'Pain management', 'Nessuna video correzione']
    },
    pro: {
      videosPerCycle: 12,
      cyclePrice: '€24.90',
      features: [
        'Programma completo 6 settimane',
        '12 video correzioni AI (2/settimana)',
        'Technique score tracking',
        'Video tutorial HD'
      ]
    },
    premium: {
      videosPerCycle: 999,
      cyclePrice: '€39.90',
      features: [
        'Tutto del Pro',
        'Video correzioni illimitate',
        'Coach check-in ogni 2 settimane',
        'Priority support'
      ]
    }
  };

  return tiers[tier as keyof typeof tiers] || tiers.free;
}
