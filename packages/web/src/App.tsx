import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './lib/i18n';

// Critical routes (eager loaded)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Non-critical routes (lazy loaded for code splitting)
const Pricing = lazy(() => import("./pages/Pricing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const BodyCompositionScan = lazy(() => import("./pages/BodyCompositionScan"));
const BiomechanicsQuiz = lazy(() => import("./pages/BiomechanicsQuiz"));
const Screening = lazy(() => import("./pages/Screening"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Workout = lazy(() => import('./pages/Workout'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
const RecoveryScreening = lazy(() => import('./components/RecoveryScreening'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

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
    <LanguageProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* ONBOARDING - Senza auth per test */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* PERCORSO PRINCIPALE - Senza auth per test */}
            <Route path="/body-scan" element={<BodyCompositionScan />} />
            <Route path="/quiz" element={<BiomechanicsQuiz />} />
            <Route path="/screening" element={<Screening />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* RECOVERY - Senza auth per test */}
            <Route path="/recovery-screening" element={<RecoveryScreening />} />

            {/* WORKOUT */}
            <Route path="/workout" element={<Workout />} />
            <Route path="/workout-session" element={<WorkoutSession />} />

            {/* ADMIN DASHBOARD */}
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
