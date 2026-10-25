import { useState } from 'react'

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/v1'
  )
  const [notifications, setNotifications] = useState(true)
  const [autoAnalysis, setAutoAnalysis] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your BrandShield AI workspace, API connection and preferences.</p>
      </div>

      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* API Config */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>⚙️ API Configuration</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Backend API Base URL</label>
            <input
              className="search-input"
              style={{ width: '100%', paddingLeft: 14 }}
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>API Key (optional)</label>
            <input
              className="search-input"
              style={{ width: '100%', paddingLeft: 14 }}
              type="password"
              placeholder="sk-••••••••••••••••"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="badge badge-success">● Connected</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Backend is reachable</span>
          </div>
        </div>

        {/* Workspace */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>🏢 Workspace</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Workspace Name',  val: 'Acme FinTech' },
              { label: 'Your Email',      val: 'admin@acmefintech.com' },
              { label: 'Role',            val: 'ADMINISTRATOR' },
              { label: 'Plan',            val: 'Enterprise' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  defaultValue={f.val}
                  readOnly={f.label === 'Role' || f.label === 'Plan'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>🔔 Preferences</div>
          {[
            { label: 'Email notifications for critical violations', val: notifications, set: setNotifications },
            { label: 'Auto-analyse on submission upload',          val: autoAnalysis,  set: setAutoAnalysis },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: 14 }}>{p.label}</span>
              <label className="switch">
                <input type="checkbox" checked={p.val} onChange={e => p.set(e.target.checked)} />
                <span className="switch-slider" />
              </label>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
          <button className="btn btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  )
}
