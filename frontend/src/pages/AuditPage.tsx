import { useState } from 'react'

const AUDIT_EVENTS = [
  { id: 1, action: 'ANALYSIS_RUN',      user: 'sarah@acme.com',  resource: 'sub-001',   detail: 'Ran compliance analysis on Q4 Campaign Brief',   ts: '2024-10-24 14:32:11', ip: '192.168.1.42' },
  { id: 2, action: 'GUIDELINE_UPDATED', user: 'admin@acme.com',  resource: 'gl-005',    detail: 'Deactivated Prohibited Slang Blacklist guideline', ts: '2024-10-24 13:18:04', ip: '192.168.1.10' },
  { id: 3, action: 'SUBMISSION_APPROVED',user: 'tom@acme.com',   resource: 'sub-002',   detail: 'Approved EU Product Launch Copy submission',       ts: '2024-10-23 16:45:30', ip: '10.0.0.25' },
  { id: 4, action: 'LOGIN',             user: 'priya@vertex.com', resource: '—',        detail: 'User authenticated via JWT',                       ts: '2024-10-23 09:01:55', ip: '10.0.1.8' },
  { id: 5, action: 'SUBMISSION_REJECTED',user: 'admin@acme.com', resource: 'sub-004',   detail: 'Rejected Social Media Ad Copy — 5 critical violations', ts: '2024-10-22 11:22:45', ip: '192.168.1.10' },
  { id: 6, action: 'ANALYSIS_RUN',      user: 'alex@techpulse.io', resource: 'sub-006', detail: 'Ran compliance analysis on Investor Deck Slides',  ts: '2024-10-21 17:08:22', ip: '203.0.113.5' },
  { id: 7, action: 'USER_CREATED',      user: 'admin@acme.com',  resource: 'usr-009',   detail: 'Created new REVIEWER account for james@acme.com',  ts: '2024-10-20 10:14:39', ip: '192.168.1.10' },
]

const ACTION_COLORS: Record<string, string> = {
  ANALYSIS_RUN: '#60a5fa',
  GUIDELINE_UPDATED: '#a78bfa',
  SUBMISSION_APPROVED: '#34d399',
  SUBMISSION_REJECTED: '#f87171',
  LOGIN: '#94a3b8',
  USER_CREATED: '#fbbf24',
}

export default function AuditPage() {
  const [search, setSearch] = useState('')

  const filtered = AUDIT_EVENTS.filter(e =>
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.user.toLowerCase().includes(search.toLowerCase()) ||
    e.detail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h1>Audit Log</h1>
        <p>Immutable log of all compliance events, user actions, and system activity.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder="Search audit log…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select">
          <option>All Events</option>
          <option>Analysis Runs</option>
          <option>Approvals / Rejections</option>
          <option>System</option>
        </select>
        <button className="btn btn-secondary btn-sm">⬇ Export CSV</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Resource</th>
              <th>Detail</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{e.ts}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: ACTION_COLORS[e.action] ?? '#94a3b8',
                    background: `${ACTION_COLORS[e.action] ?? '#94a3b8'}18`,
                    padding: '3px 9px', borderRadius: 4
                  }}>
                    {e.action}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.user}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.resource}</td>
                <td style={{ fontSize: 13, maxWidth: 300 }}>{e.detail}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{e.ip}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No events match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
