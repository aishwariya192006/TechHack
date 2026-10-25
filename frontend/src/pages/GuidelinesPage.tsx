import { useState } from 'react'

const MOCK_GUIDELINES = [
  { id: 'gl-001', title: 'No Absolute Guarantees',       category: 'TERMINOLOGY', severity: 'CRITICAL', active: true,  description: 'Prohibit usage of "100%", "guaranteed", "always" as absolute claims.' },
  { id: 'gl-002', title: 'Executive Tone Standard',       category: 'TONE',        severity: 'HIGH',     active: true,  description: 'All client-facing copy must score ≥7/10 on formality index.' },
  { id: 'gl-003', title: 'Competitor Comparison Limits',  category: 'MESSAGING',   severity: 'HIGH',     active: true,  description: 'Do not claim superiority over named competitors without substantiated data.' },
  { id: 'gl-004', title: 'FTC Disclosure Requirement',    category: 'LEGAL',       severity: 'CRITICAL', active: true,  description: 'Financial products must include FTC-compliant risk disclosures.' },
  { id: 'gl-005', title: 'Prohibited Slang Blacklist',    category: 'TERMINOLOGY', severity: 'MEDIUM',   active: false, description: 'Avoid informal language: crazy, insane, killer, epic in brand copy.' },
  { id: 'gl-006', title: 'EU GDPR Data Claims',           category: 'LEGAL',       severity: 'CRITICAL', active: true,  description: 'Data-handling claims must align with GDPR Article 13 disclosures.' },
]

const CATEGORY_COLORS: Record<string, string> = {
  TERMINOLOGY: '#60a5fa',
  TONE:        '#a78bfa',
  MESSAGING:   '#34d399',
  LEGAL:       '#f87171',
}

export default function GuidelinesPage() {
  const [search, setSearch] = useState('')
  const [guidelines, setGuidelines] = useState(MOCK_GUIDELINES)

  const filtered = guidelines.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  )

  function toggleActive(id: string) {
    setGuidelines(gs => gs.map(g => g.id === id ? { ...g, active: !g.active } : g))
  }

  return (
    <div>
      <div className="page-header">
        <h1>Brand Guidelines</h1>
        <p>Manage compliance rules and brand policy guidelines applied to all document analysis.</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{guidelines.length}</div>
          <div className="stat-label">Total Guidelines</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#34d399' }}>{guidelines.filter(g => g.active).length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f87171' }}>{guidelines.filter(g => g.severity === 'CRITICAL').length}</div>
          <div className="stat-label">Critical Rules</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{guidelines.filter(g => !g.active).length}</div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder="Search guidelines…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm">+ Add Guideline</button>
      </div>

      {/* Guideline cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(g => (
          <div key={g.id} className="card" style={{ opacity: g.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${CATEGORY_COLORS[g.category]}20`,
                border: `1px solid ${CATEGORY_COLORS[g.category]}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0
              }}>
                {g.category === 'TERMINOLOGY' ? '🔤' : g.category === 'TONE' ? '🎵' : g.category === 'LEGAL' ? '⚖️' : '📢'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{g.title}</span>
                  <span className={`tag sev-${g.severity.toLowerCase()}`} style={{ fontSize: 11 }}>{g.severity}</span>
                  <span style={{ fontSize: 12, color: CATEGORY_COLORS[g.category], background: `${CATEGORY_COLORS[g.category]}18`, padding: '2px 8px', borderRadius: 4 }}>{g.category}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{g.description}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>ID: {g.id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.active ? 'Active' : 'Inactive'}</div>
                <label className="switch">
                  <input type="checkbox" checked={g.active} onChange={() => toggleActive(g.id)} />
                  <span className="switch-slider" />
                </label>
                <button className="btn btn-secondary btn-sm">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
