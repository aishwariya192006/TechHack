import React, { useState } from 'react';
import { analysisApi, submissionsApi, type FindingItem } from '../api/client';
import { useAuth } from '../context/AuthContext';

const SAMPLE_TEMPLATES = [
  {
    name: 'High-Violation Sample (Banned Terms & Absolutes)',
    text: 'Our next-generation trading platform delivers a 100% risk-free investment experience with foolproof algorithmic execution. It is the definitive cure for market volatility and ensures promised returns for all institutional clients.',
  },
  {
    name: 'Stale Fact Sample (Expired Substantiation)',
    text: 'Acme FinTech processes $4.2B in annualized volume across 25 global jurisdictions with 99.999% uptime, as certified in our 2023 Q1 compliance review.',
  },
  {
    name: 'Compliant B2B Sample (Certified Copy)',
    text: 'Acme FinTech™ provides institutionally hedged digital asset infrastructure with high-throughput settlement. Investments are subject to market risk and past performance is not indicative of future results.',
  },
];

export default function AnalysisPage() {
  const { activeBrandProfileId, token } = useAuth();
  const [text, setText] = useState<string>(SAMPLE_TEMPLATES[0].text);
  const [provider, setProvider] = useState<string>('Azure OpenAI');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [findings, setFindings] = useState<FindingItem[] | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // SSE Streaming state
  const [streaming, setStreaming] = useState<boolean>(false);
  const [stages, setStages] = useState<Record<string, { latency_ms?: number; status: string }>>({});

  const runLiveAnalysis = async () => {
    if (!text.trim()) {
      setError('Please enter document content to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setFindings(null);
    const start = performance.now();
    try {
      const res = await analysisApi.analyzeLive(text, activeBrandProfileId, provider);
      const end = performance.now();
      setLatencyMs(res.latency_ms || Math.round(end - start));
      setFindings(res.findings || []);
    } catch (err: any) {
      setError(err.message || 'Analysis failed to execute on backend engine.');
    } finally {
      setLoading(false);
    }
  };

  const runSSEStreamingAnalysis = async () => {
    if (!text.trim()) {
      setError('Please enter document content to analyze.');
      return;
    }
    setStreaming(true);
    setError(null);
    setStages({});
    setFindings([]);

    try {
      // 1. Establish submission
      const sub = await submissionsApi.submitText(
        `Stream Analysis - ${new Date().toLocaleTimeString()}`,
        activeBrandProfileId,
        text
      );

      // 2. Open EventSource
      const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/v1';
      const eventSource = new EventSource(
        `${baseUrl}/submissions/${sub.id}/analyze/stream?token=${encodeURIComponent(token || '')}`
      );

      eventSource.addEventListener('STAGE_1_DETERMINISTIC_COMPLETE', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setStages((prev) => ({
          ...prev,
          stage1: { latency_ms: data.latency_ms, status: `Complete (${data.findings_count} hits)` },
        }));
      });

      eventSource.addEventListener('STAGE_2_TEMPORAL_FACT_RAG_COMPLETE', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setStages((prev) => ({
          ...prev,
          stage2: { latency_ms: data.latency_ms, status: `Complete (${data.stale_facts} stale facts)` },
        }));
      });

      eventSource.addEventListener('STAGE_3_PRIVACY_GATE_VERIFIED', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setStages((prev) => ({
          ...prev,
          stage3: { latency_ms: data.latency_ms, status: `Verified (${data.provider})` },
        }));
      });

      eventSource.addEventListener('STAGE_4_TRIAGE_COMPLETE', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setStages((prev) => ({
          ...prev,
          stage4: { latency_ms: data.latency_ms, status: `Triaged (${data.total_findings} total findings)` },
        }));
      });

      eventSource.addEventListener('PIPELINE_COMPLETE', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setFindings(data.findings || []);
        setLatencyMs(data.duration_ms);
        setStreaming(false);
        eventSource.close();
      });

      eventSource.addEventListener('PIPELINE_ERROR', (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setError(data.error || 'Pipeline encountered an error during streaming.');
        setStreaming(false);
        eventSource.close();
      });

      eventSource.onerror = () => {
        setStreaming(false);
        eventSource.close();
      };
    } catch (err: any) {
      setError(err.message || 'Failed to initialize streaming pipeline.');
      setStreaming(false);
    }
  };

  const sevColor: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#f59e0b',
    LOW: '#3b82f6',
  };

  return (
    <div>
      <div className="page-header">
        <h1>Brand Compliance &amp; Verification Engine</h1>
        <p>Verify content against active brand guidelines, factual records, and compliance rules.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: 14, borderRadius: 8, marginBottom: 20, color: '#fca5a5' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Preset Selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>Quick Test Samples:</span>
        {SAMPLE_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.name}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 11 }}
            onClick={() => {
              setText(tmpl.text);
              setFindings(null);
            }}
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start', gap: 20 }}>
        {/* Input Panel */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>
              Content Copy Under Review
            </div>

            <textarea
              className="form-input"
              style={{ minHeight: 180, width: '100%', fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.5 }}
              placeholder="Paste marketing copy, legal disclaimer, or campaign brief here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Provider:</span>
                <select
                  className="form-select"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="Azure OpenAI">Azure OpenAI (Zero-Retention)</option>
                  <option value="Anthropic">Anthropic Claude (VPC)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={runLiveAnalysis}
                  disabled={loading || streaming}
                >
                  {loading ? 'Analyzing Content…' : 'Analyze Content'}
                </button>
              </div>
            </div>
          </div>

          {/* SSE Stage Tracker (when streaming active) */}
          {(streaming || Object.keys(stages).length > 0) && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>
                Verification Stage Progress
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { key: 'stage1', label: 'Stage 1: Aho-Corasick Deterministic Engine' },
                  { key: 'stage2', label: 'Stage 2: Temporal Fact Grounding & Hybrid RAG' },
                  { key: 'stage3', label: 'Stage 3: Privacy-Gated Boundary & SLA Watchdog' },
                  { key: 'stage4', label: 'Stage 4: Calibrated Triage & Automation Bias Guard' },
                ].map((s) => {
                  const stageInfo = stages[s.key];
                  return (
                    <div
                      key={s.key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--glass-bg)',
                        borderRadius: 6,
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: stageInfo ? '#34d399' : 'var(--text-muted)' }}>
                        {stageInfo ? `✓ ${stageInfo.status} (${stageInfo.latency_ms?.toFixed(1) || '<1'}ms)` : 'Waiting…'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title">
                Verification Findings
              </div>
              {latencyMs !== null && (
                <span className="badge badge-success" style={{ fontSize: 11 }}>
                  {latencyMs} ms latency
                </span>
              )}
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 24, marginBottom: 10, color: 'var(--brand-400)' }}>●</div>
                <div>Scanning AST against corporate brand guidelines &amp; approved facts…</div>
              </div>
            )}

            {!loading && findings === null && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 24, marginBottom: 10, color: 'var(--text-muted)' }}>§</div>
                <div>Click "Analyze Content" to execute compliance verification.</div>
              </div>
            )}

            {!loading && findings !== null && findings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 36, color: '#10b981', marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>
                  Verified Compliant
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  No terminology breaches, tone deviations, or stale factual statements detected.
                </div>
              </div>
            )}

            {!loading && findings !== null && findings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Detected {findings.length} issue{findings.length > 1 ? 's' : ''} across verification pipeline:
                </div>

                {findings.map((f, idx) => {
                  const isNeedsVerification = f.triage_status === 'NEEDS_VERIFICATION' || f.triage_status === 'NEEDS_VERIFICATION_MISSING_EVIDENCE';
                  const isHumanReview = f.triage_status === 'ROUTED_TO_HUMAN_LOW_CONFIDENCE';
                  const isFlagged = f.triage_status === 'FLAGGED_HIGH_CONFIDENCE';
                  const isStale = f.triage_status === 'STALE_FACT_REVERIFY';

                  return (
                    <div
                      key={f.id || idx}
                      style={{
                        padding: 14,
                        background: 'var(--glass-bg)',
                        borderRadius: 8,
                        borderLeft: `4px solid ${isNeedsVerification ? '#f59e0b' : (sevColor[f.severity] || '#f59e0b')}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                          {f.issue_category} — <span style={{ color: sevColor[f.severity] }}>{f.severity}</span>
                        </span>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {isNeedsVerification && (
                            <span className="badge badge-warning" style={{ fontSize: 10, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                              Needs verification
                            </span>
                          )}
                          {isHumanReview && (
                            <span className="badge badge-secondary" style={{ fontSize: 10, background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: '1px solid #64748b' }}>
                              Human review
                            </span>
                          )}
                          {isFlagged && (
                            <span className="badge badge-danger" style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #ef4444' }}>
                              Flagged
                            </span>
                          )}
                          {isStale && (
                            <span className="badge badge-warning" style={{ fontSize: 10, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid #f59e0b' }}>
                              Stale fact reverify
                            </span>
                          )}
                          <span className="badge badge-info" style={{ fontSize: 10 }}>
                            {f.detector_source}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                        {f.explanation_reason}
                      </div>

                      {f.suggested_correction && (
                        <div
                          style={{
                            fontSize: 12,
                            color: '#34d399',
                            background: 'rgba(16,185,129,0.08)',
                            padding: '6px 10px',
                            borderRadius: 4,
                            border: '1px solid rgba(16,185,129,0.15)',
                          }}
                        >
                          <strong>Suggested Replacement:</strong> "{f.suggested_correction}"
                        </div>
                      )}

                      {/* Evidence Link / Citation Box */}
                      {f.evidence_source && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56,189,248,0.06)', padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(56,189,248,0.15)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Evidence citation:</span>
                          {f.evidence_link ? (
                            <a href={f.evidence_link} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                              {f.evidence_source}
                            </a>
                          ) : (
                            <span>{f.evidence_source}</span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                        <span>Status: {isNeedsVerification ? 'Needs verification' : (isHumanReview ? 'Routed to human review' : f.triage_status)}</span>
                        <span>Prioritisation signal: {Math.round(f.confidence_score * 100)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
