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

  return (
    <div className="app">
      {/* Ambient 3D Geometric Scene across all internal pages */}
      <div className="app-geom-ambient" aria-hidden="true">
        <div className="landing-geom-cube" style={{ opacity: 0.35, top: '4%', right: '5%' }}>
          <svg width="120" height="120" viewBox="0 0 140 140" fill="none">
            <polygon points="70,18 122,46 70,74 18,46" fill="#7da2ff" />
            <polygon points="18,46 70,74 70,126 18,98" fill="#3b66e8" />
            <polygon points="70,74 122,46 122,98 70,126" fill="#2950d6" />
          </svg>
        </div>
        <div className="landing-geom-torus" style={{ opacity: 0.35, bottom: '5%', left: '270px' }}>
          <svg width="130" height="130" viewBox="0 0 150 150" fill="none">
            <path
              d="M 75 18 C 108 18 134 42 134 75 C 134 108 108 132 75 132 C 42 132 16 108 16 75 C 16 42 42 18 75 18 Z M 75 48 C 60 48 48 60 48 75 C 48 90 60 102 75 102 C 90 102 102 90 102 75 C 102 60 90 48 75 48 Z"
              fill="#305fee"
              transform="rotate(-26 75 75)"
            />
          </svg>
        </div>
        <div className="landing-dark-sphere sphere-right-small" style={{ top: '30%', right: '8%' }} />
      </div>

      <Sidebar />
      <div className="main">
        <div className="page fade-in">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/governance" element={<GovernancePage />} />
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
