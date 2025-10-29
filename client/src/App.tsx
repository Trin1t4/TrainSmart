import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import BodyCompositionScan from "./pages/BodyCompositionScan";
import BiomechanicsQuiz from "./pages/BiomechanicsQuiz";
import Screening from "./pages/Screening"; // ✅ CAMBIATO DA Assessment
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Workout from '@/pages/Workout';
import WorkoutSession from '@/pages/WorkoutSession';

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
        {/* ✅ ROUTE AGGIORNATA */}
        <Route
          path="/screening"
          element={
            <ProtectedRoute>
              <Screening />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout-session" element={<WorkoutSession />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
