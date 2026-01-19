import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './lib/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Critical routes (eager loaded)
import Landing from "./pages/Landing";
import ModeSelection from "./pages/ModeSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResponsiveLayout from "./components/ResponsiveLayout";

// Non-critical routes (lazy loaded for code splitting)
const Pricing = lazy(() => import("./pages/Pricing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const CoachSetup = lazy(() => import("./pages/CoachSetup"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const PlayerDetail = lazy(() => import("./pages/PlayerDetail"));
const BodyCompositionScan = lazy(() => import("./pages/BodyCompositionScan"));
const Screening = lazy(() => import("./pages/Screening"));
const ScreeningFull = lazy(() => import("./pages/ScreeningFull"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Workout = lazy(() => import('./pages/Workout'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
const RecoveryScreening = lazy(() => import('./pages/RecoveryScreening'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VideoFeedback = lazy(() => import('./pages/VideoFeedback'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Stats = lazy(() => import('./pages/Stats'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      <p className="text-slate-400 mt-4">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <ResponsiveLayout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/get-started" element={<ModeSelection />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />

              {/* ONBOARDING - Senza auth per test */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* COACH / TEAM ROUTES */}
              <Route path="/coach/setup" element={<CoachSetup />} />
              <Route path="/coach/team/:teamId" element={<CoachDashboard />} />
              <Route path="/coach/team/:teamId/player/:playerId" element={<PlayerDetail />} />

              {/* PERCORSO PRINCIPALE - Senza auth per test */}
              <Route path="/body-scan" element={<BodyCompositionScan />} />
              <Route path="/screening" element={<Screening />} />
              <Route path="/screening-full" element={<ScreeningFull />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* RECOVERY - Senza auth per test */}
              <Route path="/recovery-screening" element={<RecoveryScreening />} />

              {/* WORKOUT */}
              <Route path="/workout" element={<Workout />} />
              <Route path="/workout-session" element={<WorkoutSession />} />

              {/* ADMIN DASHBOARD */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* VIDEO FEEDBACK */}
              <Route path="/video-feedback/:correctionId" element={<VideoFeedback />} />

              {/* PAYMENT */}
              <Route path="/payment-success" element={<PaymentSuccess />} />

              {/* MOBILE NAV ROUTES */}
              <Route path="/stats" element={<Stats />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ResponsiveLayout>
        </BrowserRouter>
      </LanguageProvider>
      {/* React Query DevTools - solo in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
