import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import BodyCompositionScan from "./pages/BodyCompositionScan";
import BiomechanicsQuiz from "./pages/BiomechanicsQuiz";
import Screening from "./pages/Screening";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Workout from './pages/Workout';
import WorkoutSession from './pages/WorkoutSession';
import RecoveryScreening from './components/RecoveryScreening';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
