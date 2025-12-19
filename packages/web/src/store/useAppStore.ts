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

// Beta overrides interface
interface BetaOverrides {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  goal: string | null;
  location: 'home' | 'gym' | null;
  painAreas: Array<{ area: string; intensity: number }> | null;
  frequency: number | null;
  sessionDuration: number | null;
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

  // Beta tester overrides (complete)
  betaOverrides: BetaOverrides;
  setBetaOverride: <K extends keyof BetaOverrides>(key: K, value: BetaOverrides[K]) => void;
  resetBetaOverrides: () => void;

  // Legacy compatibility
  fitnessLevelOverride: 'beginner' | 'intermediate' | 'advanced' | null;
  setFitnessLevelOverride: (level: 'beginner' | 'intermediate' | 'advanced' | null) => void;
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

      // Beta tester overrides (complete)
      betaOverrides: {
        fitnessLevel: null,
        goal: null,
        location: null,
        painAreas: null,
        frequency: null,
        sessionDuration: null,
      },
      setBetaOverride: (key, value) => set((state) => ({
        betaOverrides: { ...state.betaOverrides, [key]: value },
        // Sync legacy fitnessLevelOverride
        ...(key === 'fitnessLevel' ? { fitnessLevelOverride: value as any } : {}),
      })),
      resetBetaOverrides: () => set({
        betaOverrides: {
          fitnessLevel: null,
          goal: null,
          location: null,
          painAreas: null,
          frequency: null,
          sessionDuration: null,
        },
        fitnessLevelOverride: null,
      }),

      // Legacy compatibility
      fitnessLevelOverride: null,
      setFitnessLevelOverride: (level) => set((state) => ({
        fitnessLevelOverride: level,
        betaOverrides: { ...state.betaOverrides, fitnessLevel: level },
      })),
    }),
    {
      name: 'fitness-flow-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Solo questi vengono persistiti
        onboardingData: state.onboardingData,
        userId: state.userId,
        currentProgramId: state.currentProgramId,
        betaOverrides: state.betaOverrides,
        fitnessLevelOverride: state.fitnessLevelOverride,
        // sidebarOpen NON viene persistito (UI state temporaneo)
      }),
    }
  )
);
