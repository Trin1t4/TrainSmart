import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { exerciseName, weight, reps, notes } = req.body;
    
    // Get session from cookie
    const token = req.cookies['sb-access-token'] || req.cookies['sb-mhcdxqhhlrujbjxtgnmz-auth-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    console.log('💾 Saving assessment for user:', user.id, exerciseName, weight, reps);

    // Check if assessment exists
    const { data: existing } = await supabase
      .from('assessments')
      .select('id, exercises')
      .eq('user_id', user.id)
      .single();

    const exerciseData = {
      name: exerciseName,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      notes: notes || null
    };

    if (existing) {
      // Update existing
      const exercises = existing.exercises || [];
      const idx = exercises.findIndex(e => e.name === exerciseName);
      
      if (idx >= 0) {
        exercises[idx] = exerciseData;
      } else {
        exercises.push(exerciseData);
      }

      const { error } = await supabase
        .from('assessments')
        .update({ 
          exercises,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
      console.log('✅ Assessment updated');
    } else {
      // Create new
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'gym',
          exercises: [exerciseData],
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('✅ Assessment created');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error saving assessment:', error);
    return res.status(500).json({ error: error.message });
  }
}