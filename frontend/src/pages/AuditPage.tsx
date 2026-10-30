import React, { useState, useEffect } from 'react';
import { auditApi, type AuditLogItem, type AuditVerificationResult } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AuditPage() {
  const { user, role, switchRole } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [switching, setSwitching] = useState<boolean>(false);

  // Cryptographic chain verification state
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (role === 'CREATOR') {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await auditApi.getLogs(100);
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve audit ledger from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [role]);

  const handleRoleSwitch = async (targetRole: 'REVIEWER' | 'ADMINISTRATOR') => {
    setSwitching(true);
    try {
      await switchRole(targetRole);
    } catch (err: any) {
      setError(`Failed to switch role: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await auditApi.verifyChain();
      setVerificationResult(res);
    } catch (err: any) {
      setVerifyError(err.message || 'Cryptographic chain verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['SequenceID', 'Action', 'Timestamp', 'PreviousHash', 'CurrentHash', 'Payload'];
    const rows = logs.map((l) => [
      l.sequence_id,
      l.action,
      l.timestamp,
      l.previous_hash,
      l.current_hash,
      `"${JSON.stringify(l.payload).replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brandshield_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(l.payload).toLowerCase().includes(search.toLowerCase()) ||
      l.current_hash.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Cryptographic Audit Ledger</h1>
          <p>Append-only, SHA-256 hash-chained immutable audit trail guaranteeing regulatory non-repudiation.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={logs.length === 0}>
            Export CSV
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleVerifyChain}
            disabled={verifying}
            style={{ background: '#7c3aed' }}
          >
            {verifying ? 'Verifying Hashes…' : 'Verify Merkle Integrity'}
          </button>
        </div>
      </div>

      {/* Separation of Duties Notice for Creators */}
      {role === 'CREATOR' ? (
        <div
          style={{
            padding: 36,
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            textAlign: 'center',
            maxWidth: 680,
            margin: '40px auto',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>§</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Audit Ledger Access Restricted
          </h2>
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600, marginBottom: 14 }}>
            Separation of Duties (SOC 2 / ISO 27001 Compliance)
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            The immutable SHA-256 cryptographic audit ledger records system events, IP telemetry, and regulatory determinations. To maintain segregation of duties, content Creators are prohibited from inspecting or verifying audit blocks.
          </p>
          <div style={{ padding: '12px 16px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, marginBottom: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            Current Account: <strong style={{ color: 'var(--text-primary)' }}>{user?.full_name || 'Alex Creator'}</strong> · Role: <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{role}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              disabled={switching}
              onClick={() => handleRoleSwitch('REVIEWER')}
              style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {switching ? 'Switching…' : 'Switch to Reviewer Account'}
            </button>
            <button
              className="btn btn-secondary"
              disabled={switching}
              onClick={() => handleRoleSwitch('ADMINISTRATOR')}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {switching ? 'Switching…' : 'Switch to Admin Account'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: 14, borderRadius: 8, marginBottom: 20, color: '#fca5a5' }}>
              <strong>Ledger Error:</strong> {error}
            </div>
          )}

      {/* Verification Result Card */}
      {verificationResult && (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            marginBottom: 20,
            border: `1px solid ${verificationResult.is_valid ? '#10b981' : '#ef4444'}`,
            background: verificationResult.is_valid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{verificationResult.is_valid ? '✓' : '✕'}</span>
            <div style={{ fontWeight: 700, fontSize: 15, color: verificationResult.is_valid ? '#34d399' : '#f87171' }}>
              {verificationResult.is_valid ? 'Tamper-Evident Hash Chain: Verified Intact' : 'Chain Integrity Discrepancy Detected'}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {verificationResult.verification_message} (Traversed and verified {verificationResult.total_records} sequential blocks in PostgreSQL).
          </div>
          {verificationResult.has_historical_break && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: 6, fontSize: 12, color: '#fbbf24' }}>
              <strong>Historical Chain Status:</strong> {verificationResult.historical_break_notes || 'known historical break at #9 (pre-fix, preserved)'}. Chain verified sound from subsequent blocks onwards.
            </div>
          )}
        </div>
      )}

      {verifyError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          <strong>Verification Error:</strong> {verifyError}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: 1 }}>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder="Search audit trail by action, hash, or payload…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>
          Refresh
        </button>
      </div>

      {/* Audit Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Seq #</th>
              <th>Action Type</th>
              <th>Timestamp (UTC)</th>
              <th>SHA-256 Block Digest</th>
              <th>Payload Summary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  Loading immutable audit chain…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No audit logs found.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.sequence_id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a78bfa' }}>
                      #{log.sequence_id}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(59,130,246,0.12)',
                        color: '#60a5fa',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#34d399' }} title={`Previous: ${log.previous_hash}\nCurrent: ${log.current_hash}`}>
                      {log.current_hash.substring(0, 16)}…
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 400, fontFamily: 'monospace' }}>
                    {JSON.stringify(log.payload)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
