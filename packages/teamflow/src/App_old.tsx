import AssessmentFlow from './components/AssessmentFlow';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import AssessmentFlow from './components/AssessmentFlow';
import Workout from '@/pages/Workout';
import WorkoutSession from '@/pages/WorkoutSession';
import RecoveryScreening from './components/RecoveryScreening';
import AssessmentFlow from './components/AssessmentFlow';
import DashboardSimple from './components/DashboardSimple';
import AssessmentFlow from './components/AssessmentFlow';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/body-scan"
          element={
            <ProtectedRoute>
              <BodyCompositionScan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <BiomechanicsQuiz />
            </ProtectedRoute>
          }
        />

        <Route
          path="/screening"
          element={
            <ProtectedRoute>
              <Screening />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recovery-screening"
          element={
            <ProtectedRoute>
              <RecoveryScreening />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSimple  />
            </ProtectedRoute>
          }
        />

        <Route path="/workout" element={<Workout />} />
        <Route path="/workout-session" element={<WorkoutSession />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/quiz" element={<QuizComponent />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/assessment" element={<AssessmentFlow />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardSimple /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
