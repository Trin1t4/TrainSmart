import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './lib/i18n';
import { ThemeProvider } from './lib/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Note: All services are initialized centrally in main.tsx via initAllServices

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
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResponsiveLayout from "./components/ResponsiveLayout";
import CookieBanner from "./components/CookieBanner";
import InstallPWA from "./components/InstallPWA";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import BetaBanner from "./components/BetaBanner";

// Non-critical routes (lazy loaded for code splitting)
const Pricing = lazy(() => import("./pages/Pricing"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Onboarding = lazy(() => import("./pages/SlimOnboarding"));
const OptionalQuizzes = lazy(() => import("./pages/OptionalQuizzes"));
const FirstSessionAssessment = lazy(() => import("./pages/FirstSessionAssessment"));
const BodyCompositionScan = lazy(() => import("./pages/BodyCompositionScan"));
const BiomechanicsQuiz = lazy(() => import("./pages/BiomechanicsQuiz"));
const BiomechanicsQuizFull = lazy(() => import("./pages/BiomechanicsQuizFull"));
const Screening = lazy(() => import("./pages/Screening"));
const ScreeningFull = lazy(() => import("./pages/ScreeningFull"));
const DemoScreening = lazy(() => import("./pages/DemoScreening"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Workout = lazy(() => import('./pages/Workout'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
const RecoveryScreening = lazy(() => import('./pages/RecoveryScreening'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminFeatures = lazy(() => import('./pages/AdminFeatures'));
const VideoFeedback = lazy(() => import('./pages/VideoFeedback'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Stats = lazy(() => import('./pages/Stats'));
const Profile = lazy(() => import('./pages/Profile'));
const Community = lazy(() => import('./pages/Community'));
const Achievements = lazy(() => import('./pages/Achievements'));
const About = lazy(() => import('./pages/About'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground mt-4">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <BrowserRouter>
              {/* Skip link for keyboard navigation - WCAG 2.4.1 */}
              <a href="#main-content" className="skip-link">
                Salta al contenuto principale
              </a>
              <Toaster position="top-right" richColors />
              <BetaBanner />
              <ResponsiveLayout>
              <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />

              {/* LEGAL PAGES */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />

              {/* DEMO - Public (no login required) */}
              <Route path="/demo" element={<DemoScreening />} />
              <Route path="/demo/screening" element={<DemoScreening />} />

              {/* ONBOARDING - Protected */}
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/optional-quizzes" element={<ProtectedRoute><OptionalQuizzes /></ProtectedRoute>} />
              <Route path="/first-session-assessment" element={<ProtectedRoute><FirstSessionAssessment /></ProtectedRoute>} />

              {/* PERCORSO PRINCIPALE - Protected */}
              <Route path="/body-scan" element={<ProtectedRoute><BodyCompositionScan /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><BiomechanicsQuiz /></ProtectedRoute>} />
              <Route path="/quiz-full" element={<ProtectedRoute><BiomechanicsQuizFull /></ProtectedRoute>} />
              <Route path="/screening" element={<ProtectedRoute><Screening /></ProtectedRoute>} />
              <Route path="/screening-full" element={<ProtectedRoute><ScreeningFull /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* RECOVERY - Protected */}
              <Route path="/recovery-screening" element={<ProtectedRoute><RecoveryScreening /></ProtectedRoute>} />

              {/* WORKOUT - Protected */}
              <Route path="/workout" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
              <Route path="/workout-session" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />

              {/* ADMIN DASHBOARD - Protected + Role Check in component */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/features" element={<ProtectedRoute><AdminFeatures /></ProtectedRoute>} />

              {/* VIDEO FEEDBACK - Protected */}
              <Route path="/video-feedback/:correctionId" element={<ProtectedRoute><VideoFeedback /></ProtectedRoute>} />

              {/* PAYMENT - Protected */}
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

              {/* MOBILE NAV ROUTES - Protected */}
              <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* SOCIAL FEATURES - Protected */}
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ResponsiveLayout>
            {/* Cookie Banner - GDPR Compliance */}
            <CookieBanner />
            {/* PWA Install Prompt */}
            <InstallPWA />
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
        {/* React Query DevTools - solo in development */}
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
