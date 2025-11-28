// Aggiungi questo alla funzione saveToSupabase (circa riga 45)
const saveToSupabase = async (data: any) => {
  try {
    console.log('[ONBOARDING] 📤 Saving to Supabase:', JSON.stringify(data, null, 2));
    
    // Prova a prendere l'utente da Supabase
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    let userId = user?.id;
    
    // Se non c'è utente, crea un ID di test
    if (!userId) {
      userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'test-user-' + Date.now();
        localStorage.setItem('userId', userId);
        console.log('[ONBOARDING] 🆕 Created test userId:', userId);
      }
    } else {
      // Salva il vero userId
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', user.email || '');
    }
    
    console.log('[ONBOARDING] 👤 Using userId:', userId);

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        onboarding_data: data,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[ONBOARDING] ❌ Error saving to Supabase:', error);
    } else {
      console.log('[ONBOARDING] ✅ Onboarding saved successfully');
    }
  } catch (error) {
    console.error('[ONBOARDING] ❌ Exception:', error);
  }
};
