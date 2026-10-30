import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { dashboardApi, auditApi, type DashboardSummary, type GovernanceReport, type AuditLogItem } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { role } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [governance, setGovernance] = useState<GovernanceReport | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, govData, logsData] = await Promise.all([
        dashboardApi.getSummary().catch(() => null),
        dashboardApi.getGovernanceReport().catch(() => null),
        auditApi.getLogs(6).catch(() => []),
      ]);
      setSummary(sumData);
      setGovernance(govData);
      setRecentLogs(logsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  // Derived metrics
  const totalSubmissions = summary?.total_submissions || 0;
  const totalFindings = summary?.total_findings || governance?.total_findings || 0;
  const approvedCount = summary?.approved || 0;
  const awaitingReview = summary?.awaiting_review || 0;
  const passRate = totalSubmissions > 0
    ? Math.round((approvedCount / totalSubmissions) * 100)
    : 100;

  const categoryBarData = governance?.recharts_category_bar || [];
  const triagePieData = governance?.recharts_triage_pie || [];
  const reviewTrendsData = governance?.recharts_review_trends_line || [];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Compliance &amp; Governance Overview</h1>
          <p>Real-time enterprise brand governance metrics, cryptographic audit logs, and risk analysis</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchDashboardData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {loading ? 'Refreshing…' : 'Refresh Metrics'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: 14, borderRadius: 8, marginBottom: 20, color: '#fca5a5' }}>
          <strong>Telemetry Error:</strong> {error}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ '--card-accent': 'rgba(41,82,163,0.15)' } as any}>
          <div className="stat-value">{loading ? '…' : totalSubmissions}</div>
          <div className="stat-label">Total Submissions</div>
          <div className="stat-delta up">Persisted in DB</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(239,68,68,0.15)' } as any}>
          <div className="stat-value" style={{ color: totalFindings > 0 ? '#f87171' : '#34d399' }}>
            {loading ? '…' : totalFindings}
          </div>
          <div className="stat-label">Compliance Findings</div>
          <div className="stat-delta">
            {totalFindings > 0 ? `${totalFindings} detected violations` : 'Zero open violations'}
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(16,185,129,0.15)' } as any}>
          <div className="stat-value" style={{ color: '#34d399' }}>
            {loading ? '…' : `${passRate}%`}
          </div>
          <div className="stat-label">Approval Pass Rate</div>
          <div className="stat-delta up">{approvedCount} approved documents</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(245,158,11,0.15)' } as any}>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {loading ? '…' : awaitingReview}
          </div>
          <div className="stat-label">In Review Queue</div>
          <div className="stat-delta">Requires human reviewer</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recurring Issues Bar Chart */}
        <div className="card" style={{ minHeight: 340 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>
            Recurring Compliance Issues (By Severity)
          </div>
          {categoryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis stroke="#475569" allowDecimals={false} tick={{ fill: '#334155' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#ffffff', color: '#0f172a', borderRadius: 12, boxShadow: '0 8px 24px rgba(35,55,140,0.15)' }}
                />
                <Legend />
                <Bar dataKey="CRITICAL" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="HIGH" stackId="a" fill="#f97316" name="High" />
                <Bar dataKey="MEDIUM" stackId="a" fill="#f59e0b" name="Medium" />
                <Bar dataKey="LOW" stackId="a" fill="#3b82f6" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div>No violation records found in this workspace yet.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Submit new content in Brand Analysis to generate metrics.</div>
            </div>
          )}
        </div>

        {/* Triage Confidence Pie Chart */}
        <div className="card" style={{ minHeight: 340 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>
            Triage Confidence Distribution
          </div>
          {triagePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={triagePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }: any) => `${name}: ${value}`}
                >
                  {triagePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#ffffff', color: '#0f172a', borderRadius: 12, boxShadow: '0 8px 24px rgba(35,55,140,0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div>Triage distribution will render here once findings are triaged.</div>
            </div>
          )}
        </div>
      </div>

      {/* Review Trends Line Chart (Full Width) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ marginBottom: 14 }}>
          Governance Decisions Over Time
        </div>
        {reviewTrendsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reviewTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis stroke="#475569" allowDecimals={false} tick={{ fill: '#334155' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#ffffff', color: '#0f172a', borderRadius: 12, boxShadow: '0 8px 24px rgba(35,55,140,0.15)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
              <Line type="monotone" dataKey="changes_requested" stroke="#ef4444" strokeWidth={2} name="Changes Requested" />
              <Line type="monotone" dataKey="total_reviews" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 4" name="Total Activity" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Continuous trend analytics active. Decisions logged by Reviewers populate here automatically.
          </div>
        )}
      </div>

      {/* Real Audit Activity Feed */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          Recent Cryptographic Audit Trail
        </div>
        {recentLogs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentLogs.map((log) => (
              <div
                key={log.sequence_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--glass-bg)',
                  borderRadius: 8,
                  border: '1px solid var(--glass-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#a78bfa',
                      background: 'rgba(167,139,250,0.12)',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    #{log.sequence_id} {log.action}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {log.payload?.title || log.payload?.name || log.payload?.email || JSON.stringify(log.payload).substring(0, 70)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }} title={log.current_hash}>
                    SHA-256: {log.current_hash.substring(0, 10)}…
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No audit ledger entries recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
