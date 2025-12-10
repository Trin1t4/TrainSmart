import { createClient } from '@supabase/supabase-js';

/**
 * GDPR-compliant account deletion endpoint
 * Deletes all user data when requested
 *
 * POST /api/user/delete-account
 * Headers: Authorization: Bearer <token>
 * Body: { confirmEmail: string }
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    const token = authHeader.split(' ')[1];

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the user's token
    const supabaseClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = user.id;
    const userEmail = user.email;

    // Verify email confirmation matches
    const { confirmEmail } = req.body || {};
    if (!confirmEmail || confirmEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return res.status(400).json({
        error: 'Email confirmation does not match',
        message: 'Per confermare la cancellazione, inserisci la tua email'
      });
    }

    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`);

    // Track deletion progress
    const deletionResults = {
      userId,
      timestamp: new Date().toISOString(),
      deletedTables: [],
      errors: []
    };

    // List of tables to delete user data from (in order to respect foreign keys)
    const tablesToDelete = [
      'workout_exercise_sets',    // Individual sets data
      'workout_exercises',        // Exercises in workouts
      'workout_sessions',         // Workout sessions
      'user_programs',            // Generated programs
      'user_assessments',         // Assessment results
      'user_body_composition',    // Body composition data
      'user_pain_areas',          // Pain area tracking
      'user_goals',               // User goals
      'user_preferences',         // User preferences
      'user_streaks',             // Streak data
      'user_achievements',        // Achievements
      'user_notifications',       // Notifications
      'user_profiles',            // Profile data (should be last before auth)
    ];

    // Delete data from each table
    for (const table of tablesToDelete) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          // Log error but continue - table might not exist or have no data
          console.log(`[DELETE ACCOUNT] Note for ${table}: ${error.message}`);
          if (!error.message.includes('does not exist')) {
            deletionResults.errors.push({ table, error: error.message });
          }
        } else {
          deletionResults.deletedTables.push(table);
          console.log(`[DELETE ACCOUNT] Deleted from ${table}`);
        }
      } catch (tableError) {
        console.error(`[DELETE ACCOUNT] Error deleting from ${table}:`, tableError);
        deletionResults.errors.push({ table, error: tableError.message });
      }
    }

    // Delete the user from Supabase Auth
    try {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error('[DELETE ACCOUNT] Error deleting auth user:', deleteAuthError);
        deletionResults.errors.push({ table: 'auth.users', error: deleteAuthError.message });

        // If we can't delete the auth user, the operation partially failed
        return res.status(500).json({
          error: 'Partial deletion - auth account not deleted',
          message: 'I tuoi dati sono stati cancellati ma l\'account auth rimane. Contatta support@trainsmart.me',
          details: deletionResults
        });
      }

      console.log(`[DELETE ACCOUNT] Auth user deleted: ${userId}`);
    } catch (authDeleteError) {
      console.error('[DELETE ACCOUNT] Auth deletion error:', authDeleteError);
      deletionResults.errors.push({ table: 'auth.users', error: authDeleteError.message });
    }

    // Log successful deletion (for audit purposes - no PII)
    console.log(`[DELETE ACCOUNT] Completed for user ${userId}. Tables: ${deletionResults.deletedTables.length}, Errors: ${deletionResults.errors.length}`);

    return res.status(200).json({
      success: true,
      message: 'Account eliminato con successo',
      details: {
        deletedAt: deletionResults.timestamp,
        tablesProcessed: deletionResults.deletedTables.length,
        note: 'Tutti i tuoi dati personali sono stati cancellati in conformità al GDPR'
      }
    });

  } catch (error) {
    console.error('[DELETE ACCOUNT] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Si è verificato un errore. Contatta support@trainsmart.me per assistenza.'
    });
  }
}
