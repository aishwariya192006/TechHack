import { useState } from 'react'

const MOCK_SUBMISSIONS = [
  { id: 'sub-001', title: 'Q4 2024 Campaign Brief', brand: 'Acme FinTech', status: 'NEEDS_REVIEW', violations: 3, created: '2024-10-24', creator: 'Sarah K.' },
  { id: 'sub-002', title: 'EU Product Launch Copy', brand: 'Acme FinTech', status: 'APPROVED',     violations: 0, created: '2024-10-23', creator: 'Tom R.' },
  { id: 'sub-003', title: 'Annual Report Disclaimer', brand: 'Vertex Corp', status: 'IN_REVIEW',  violations: 1, created: '2024-10-22', creator: 'Priya M.' },
  { id: 'sub-004', title: 'Social Media Ad Copy',   brand: 'Acme FinTech', status: 'REJECTED',    violations: 5, created: '2024-10-21', creator: 'James L.' },
  { id: 'sub-005', title: 'Email Newsletter Oct',   brand: 'Vertex Corp', status: 'APPROVED',     violations: 0, created: '2024-10-20', creator: 'Sarah K.' },
  { id: 'sub-006', title: 'Investor Deck Slides',   brand: 'TechPulse',  status: 'NEEDS_REVIEW', violations: 2, created: '2024-10-19', creator: 'Alex W.' },
]

const STATUS_BADGE: Record<string, string> = {
  APPROVED: 'badge-success',
  NEEDS_REVIEW: 'badge-warning',
  IN_REVIEW: 'badge-info',
  REJECTED: 'badge-danger',
}

export default function SubmissionsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = MOCK_SUBMISSIONS.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.brand.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div>
      <div className="page-header">
        <h1>Submissions</h1>
        <p>All brand content submissions and their compliance review status.</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total',        val: MOCK_SUBMISSIONS.length,                                      color: 'var(--text-primary)' },
          { label: 'Approved',     val: MOCK_SUBMISSIONS.filter(s => s.status === 'APPROVED').length,     color: '#34d399' },
          { label: 'Needs Review', val: MOCK_SUBMISSIONS.filter(s => s.status === 'NEEDS_REVIEW').length, color: '#fbbf24' },
          { label: 'Rejected',     val: MOCK_SUBMISSIONS.filter(s => s.status === 'REJECTED').length,     color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder="Search submissions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button className="btn btn-primary btn-sm">+ New Submission</button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Brand</th>
              <th>Creator</th>
              <th>Status</th>
              <th>Violations</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.id}</div>
                </td>
                <td><span className="tag">{s.brand}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.creator}</td>
                <td><span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status.replace('_', ' ')}</span></td>
                <td>
                  <span style={{ color: s.violations > 0 ? '#f87171' : '#34d399', fontWeight: 700 }}>
                    {s.violations > 0 ? `⚠ ${s.violations}` : '✓ None'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.created}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm">View</button>
                    {s.status === 'NEEDS_REVIEW' && <button className="btn btn-primary btn-sm">Analyse</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No submissions match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
