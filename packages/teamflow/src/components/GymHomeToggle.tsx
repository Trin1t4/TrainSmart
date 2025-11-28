// client/src/components/WorkoutScreening/GymHomeToggle.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface GymHomeToggleProps {
  onLocationChange: (location: 'gym' | 'home') => void;
  initialLocation?: 'gym' | 'home';
}

export const GymHomeToggle: React.FC<GymHomeToggleProps> = ({
  onLocationChange,
  initialLocation = 'gym',
}) => {
  const [location, setLocation] = useState<'gym' | 'home'>(initialLocation);
  const [loading, setLoading] = useState(false);

  // Carica la preferenza salvata dell'utente
  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferred_location')
          .eq('user_id', userData.user.id)
          .single();

        if (data && !error) {
          setLocation(data.preferred_location as 'gym' | 'home');
        }
      }
    } catch (error) {
      console.error('Error loading user preference:', error);
    }
  };

  const handleLocationChange = async (newLocation: 'gym' | 'home') => {
    setLoading(true);
    setLocation(newLocation);
    onLocationChange(newLocation);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Aggiorna o inserisce la preferenza
        await supabase.from('user_preferences').upsert(
          {
            user_id: userData.user.id,
            preferred_location: newLocation,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }
    } catch (error) {
      console.error('Error saving location preference:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gym-home-toggle bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Dove ti alleni?</h3>

      <div className="flex gap-4">
        {/* Gym Button */}
        <button
          onClick={() => handleLocationChange('gym')}
          disabled={loading}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold transition duration-300 ${
            location === 'gym'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
          } disabled:opacity-50`}
        >
          <div className="text-2xl mb-2">🏋️</div>
          Palestra
        </button>

        {/* Home Button */}
        <button
          onClick={() => handleLocationChange('home')}
          disabled={loading}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold transition duration-300 ${
            location === 'home'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
          } disabled:opacity-50`}
        >
          <div className="text-2xl mb-2">🏠</div>
          Casa
        </button>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
        <p className="text-sm text-blue-800">
          {location === 'gym'
            ? '✅ Vedrai tutti gli esercizi disponibili (palestra, bilanciere, macchine, cable)'
            : '✅ Vedrai solo esercizi a corpo libero e con attrezzi basic (casa)'}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">⏳ Salvataggio in corso...</p>
        </div>
      )}
    </div>
  );
};
