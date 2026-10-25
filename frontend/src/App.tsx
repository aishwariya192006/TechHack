import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import AnalysisPage from './pages/AnalysisPage'
import SubmissionsPage from './pages/SubmissionsPage'
import GuidelinesPage from './pages/GuidelinesPage'
import AuditPage from './pages/AuditPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const pageTitle: Record<string, string> = {
    dashboard: 'Dashboard',
    analysis: 'Brand Analysis',
    submissions: 'Submissions',
    guidelines: 'Guidelines',
    audit: 'Audit Log',
    settings: 'Settings',
  }

  return (
    <BrowserRouter>
      <div className="app">
        {/* Ambient glows */}
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div className="main">
          <Topbar title={pageTitle[activePage] ?? 'BrandShield AI'} />

          <div className="page fade-in">
            {activePage === 'dashboard'    && <Dashboard />}
            {activePage === 'analysis'     && <AnalysisPage />}
            {activePage === 'submissions'  && <SubmissionsPage />}
            {activePage === 'guidelines'   && <GuidelinesPage />}
            {activePage === 'audit'        && <AuditPage />}
            {activePage === 'settings'     && <SettingsPage />}
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
