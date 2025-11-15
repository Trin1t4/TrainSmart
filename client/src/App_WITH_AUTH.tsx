import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Screening from './pages/Screening';
import Workout from './pages/Workout';
import WorkoutSession from './pages/WorkoutSession';
import QuizComponent from './components/QuizComponent_FIXED';
import AssessmentFlow from './components/AssessmentFlow';
import DashboardSimple from './components/DashboardSimple';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/quiz" element={<QuizComponent />} />
        <Route path="/screening" element={<Screening />} />
        <Route path="/assessment" element={<AssessmentFlow />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardSimple />
          </ProtectedRoute>
        } />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout-session" element={<WorkoutSession />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
