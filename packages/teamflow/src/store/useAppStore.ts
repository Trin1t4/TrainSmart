/**
 * Global App Store - Zustand
 * Sostituisce localStorage con state management type-safe
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingData {
  trainingLocation: 'home' | 'gym';
  trainingType: 'calisthenics' | 'equipment' | 'machines';
  weeklyFrequency: number;
  sessionDuration: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  painAreas?: Array<{ area: string; intensity: number }>;
}

interface AppState {
  // Onboarding
  onboardingData: OnboardingData | null;
  setOnboardingData: (data: OnboardingData) => void;
  clearOnboardingData: () => void;

  // User session
  userId: string | null;
  setUserId: (id: string) => void;
  clearSession: () => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Program state
  currentProgramId: string | null;
  setCurrentProgramId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Onboarding
      onboardingData: null,
      setOnboardingData: (data) => set({ onboardingData: data }),
      clearOnboardingData: () => set({ onboardingData: null }),

      // User session
      userId: null,
      setUserId: (id) => set({ userId: id }),
      clearSession: () => set({ userId: null, onboardingData: null, currentProgramId: null }),

      // UI state (not persisted)
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Program state
      currentProgramId: null,
      setCurrentProgramId: (id) => set({ currentProgramId: id }),
    }),
    {
      name: 'fitness-flow-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Solo questi vengono persistiti
        onboardingData: state.onboardingData,
        userId: state.userId,
        currentProgramId: state.currentProgramId,
        // sidebarOpen NON viene persistito (UI state temporaneo)
      }),
    }
  )
);
