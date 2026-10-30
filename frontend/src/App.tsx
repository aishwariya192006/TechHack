import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import SubmissionsPage from './pages/SubmissionsPage';
import GuidelinesPage from './pages/GuidelinesPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import GovernancePage from './pages/GovernancePage';

function AppShell() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Public routes don't need the shell
  const publicRoutes = ['/', '/login'];
  if (publicRoutes.includes(location.pathname)) {
    return null; // handled by Routes below
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--brand-950)', flexDirection: 'column', gap: 16
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>BS</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Authenticating session…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  const isCreator = role === 'CREATOR';
  const isReviewer = role === 'REVIEWER';
  const isAdmin = role === 'ADMINISTRATOR';

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="page fade-in">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route
              path="/governance"
              element={!isCreator ? <GovernancePage /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/audit"
              element={isAdmin ? <AuditPage /> : <Navigate to="/dashboard" replace />}
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
