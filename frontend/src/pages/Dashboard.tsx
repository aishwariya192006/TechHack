import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell
} from 'recharts'

const weeklyData = [
  { day: 'Mon', violations: 12, passed: 88 },
  { day: 'Tue', violations: 19, passed: 74 },
  { day: 'Wed', violations: 8,  passed: 92 },
  { day: 'Thu', violations: 24, passed: 68 },
  { day: 'Fri', violations: 15, passed: 83 },
  { day: 'Sat', violations: 6,  passed: 95 },
  { day: 'Sun', violations: 11, passed: 89 },
]

const recentActivity = [
  { id: 1, type: 'violation', label: 'Critical: Unsubstantiated claim in Q4 Campaign brief', time: '2 min ago', color: '#ef4444' },
  { id: 2, type: 'approved',  label: 'Passed: Multi-currency disclosure for EU launch', time: '8 min ago', color: '#10b981' },
  { id: 3, type: 'warning',   label: 'Warning: Tone deviation detected in product copy', time: '23 min ago', color: '#f59e0b' },
  { id: 4, type: 'approved',  label: 'Passed: Legal disclaimer for financial products', time: '1 hr ago', color: '#10b981' },
  { id: 5, type: 'violation', label: 'High: Prohibited term "risk-free" in email campaign', time: '2 hr ago', color: '#ef4444' },
]

const topViolations = [
  { category: 'Unsubstantiated Claims', count: 47, pct: 78, sev: 'critical' },
  { category: 'Prohibited Terminology', count: 31, pct: 52, sev: 'high' },
  { category: 'Tone Deviation',         count: 22, pct: 37, sev: 'medium' },
  { category: 'Disclosure Missing',     count: 18, pct: 30, sev: 'high' },
  { category: 'Competitor Comparison',  count: 9,  pct: 15, sev: 'medium' },
]

function ComplianceRing({ score }: { score: number }) {
  const r = 54, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="26" fontWeight="800">{score}</text>
        <text x="65" y="78" textAnchor="middle" fill="#64748b" fontSize="11">/ 100</text>
      </svg>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Compliance Score</div>
    </div>
  )
}

export default function Dashboard() {
  const [score, setScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setScore(74), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1>Compliance Overview</h1>
        <p>Enterprise brand compliance intelligence — real-time monitoring &amp; risk analysis</p>
      </div>

      {/* KPI Row */}
      <div className="grid-4">
        <div className="stat-card" style={{ '--card-accent': 'rgba(41,82,163,0.15)' } as any}>
          <span className="stat-icon">📄</span>
          <div className="stat-value">1,284</div>
          <div className="stat-label">Documents Analysed</div>
          <div className="stat-delta up">↑ 12% vs last week</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'rgba(239,68,68,0.15)' } as any}>
          <span className="stat-icon">⚠️</span>
          <div className="stat-value" style={{ color: '#f87171' }}>127</div>
          <div className="stat-label">Active Violations</div>
          <div className="stat-delta down">↑ 8% vs last week</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'rgba(16,185,129,0.15)' } as any}>
          <span className="stat-icon">✅</span>
          <div className="stat-value" style={{ color: '#34d399' }}>89.7%</div>
          <div className="stat-label">Pass Rate</div>
          <div className="stat-delta up">↑ 2.3% vs last week</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'rgba(124,58,237,0.15)' } as any}>
          <span className="stat-icon">⚡</span>
          <div className="stat-value">1.2s</div>
          <div className="stat-label">Avg Analysis Time</div>
          <div className="stat-delta up">↓ 0.3s improvement</div>
        </div>
      </div>

      {/* Main row */}
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Trend chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Weekly Compliance Trend</div>
              <div className="card-subtitle">Violations vs. Passes over the past 7 days</div>
            </div>
            <select className="form-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradPassed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradViol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#112040', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="passed"     stroke="#10b981" strokeWidth={2} fill="url(#gradPassed)" name="Passed" />
              <Area type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} fill="url(#gradViol)"   name="Violations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance score */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <ComplianceRing score={score} />
          <div style={{ width: '100%' }}>
            {[
              { label: 'Terminology', val: 82, color: '#10b981' },
              { label: 'Tone',        val: 68, color: '#f59e0b' },
              { label: 'Claims',      val: 71, color: '#60a5fa' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span>{r.label}</span><span style={{ color: r.color }}>{r.val}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${r.val}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        {/* Top violations */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Violation Categories</div>
              <div className="card-subtitle">Ranked by frequency this month</div>
            </div>
          </div>
          {topViolations.map(v => (
            <div key={v.category} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`tag sev-${v.sev}`} style={{ fontSize: 10 }}>{v.sev.toUpperCase()}</span>
                  <span style={{ fontSize: 13 }}>{v.category}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{v.count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${v.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Live Activity Feed</div>
              <div className="card-subtitle">Recent compliance events</div>
            </div>
            <span className="badge badge-success pulse">● Live</span>
          </div>
          {recentActivity.map(a => (
            <div key={a.id} className="activity-item">
              <div className="activity-dot" style={{ background: a.color }} />
              <div>
                <div style={{ fontSize: 13 }}>{a.label}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
