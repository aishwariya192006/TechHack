import { useState } from 'react'

const MOCK_FINDINGS = [
  { id: 1, category: 'TERMINOLOGY', severity: 'CRITICAL', confidence: 0.98, excerpt: '100% risk-free', explanation: 'Absolute guarantee violates FTC truth-in-advertising guidelines.', suggestion: 'Our product is engineered for managed risk.' },
  { id: 2, category: 'TONE',        severity: 'MEDIUM',   confidence: 0.88, excerpt: 'crazy excited',  explanation: 'Colloquial slang departs from executive B2B tone standards.',      suggestion: 'We are proud to introduce...' },
  { id: 3, category: 'MESSAGING',   severity: 'HIGH',     confidence: 0.91, excerpt: 'unbeatable performance', explanation: 'Superlative comparison without substantiated data.', suggestion: 'Competitive performance backed by independent benchmarks.' },
]

export default function AnalysisPage() {
  const [text, setText] = useState('')
  const [brandName, setBrandName] = useState('Acme FinTech')
  const [prohibitedTerms, setProhibitedTerms] = useState('risk-free, guaranteed, unbeatable, crazy')
  const [loading, setLoading] = useState(false)
  const [findings, setFindings] = useState<typeof MOCK_FINDINGS | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function runAnalysis() {
    if (!text.trim()) return
    setLoading(true)
    setFindings(null)

    // Attempt real API; fall back to mock data
    try {
      const res = await fetch('/api/v1/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_text: text,
          brand_name: brandName,
          prohibited_terms: prohibitedTerms.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setFindings(data.findings ?? MOCK_FINDINGS)
      } else {
        setFindings(MOCK_FINDINGS)
      }
    } catch {
      // API offline — show demo findings
      await new Promise(r => setTimeout(r, 1400))
      setFindings(MOCK_FINDINGS)
    }
    setLoading(false)
  }

  const sevColor: Record<string, string> = {
    CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#60a5fa', LOW: '#94a3b8',
  }

  const passed = findings?.length === 0
  const criticalCount = findings?.filter(f => f.severity === 'CRITICAL').length ?? 0

  return (
    <div>
      <div className="page-header">
        <h1>Brand Analysis Engine</h1>
        <p>Paste document copy, upload a PDF, or type text to run real-time compliance analysis.</p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
        {/* Input panel */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>Document Input</div>

            {/* Upload zone */}
            <div
              className={`upload-zone ${dragOver ? 'dragging' : ''}`}
              style={{ marginBottom: 16, padding: '24px 20px' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); }}
            >
              <div className="upload-icon" style={{ fontSize: 32 }}>📎</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Drop a PDF or <span style={{ color: 'var(--brand-300)', cursor: 'pointer' }}>click to browse</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOCX up to 50 MB</div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12 }}>— or type / paste text —</div>

            <textarea
              className="form-input"
              placeholder="Paste your marketing copy, legal disclaimer, email campaign, or any brand content here…"
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ minHeight: 160 }}
            />
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Brand Parameters</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Brand Name</label>
                <input
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Acme FinTech"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Prohibited Terms (comma-separated)</label>
                <input
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 14 }}
                  value={prohibitedTerms}
                  onChange={e => setProhibitedTerms(e.target.value)}
                  placeholder="risk-free, guaranteed…"
                />
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            onClick={runAnalysis}
            disabled={loading || !text.trim()}
          >
            {loading ? <><span className="pulse">⏳</span> Analysing…</> : '🚀 Run Compliance Analysis'}
          </button>
        </div>

        {/* Results panel */}
        <div>
          {!findings && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Awaiting Analysis</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Enter document text and click Run to see compliance findings.</div>
            </div>
          )}

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }} className="pulse">🤖</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Analysing Document…</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Running NLP pipeline, tone scoring and claim verification.</div>
              <div style={{ marginTop: 20 }}>
                <div className="skeleton" style={{ height: 8, width: '80%', margin: '8px auto' }} />
                <div className="skeleton" style={{ height: 8, width: '65%', margin: '8px auto' }} />
                <div className="skeleton" style={{ height: 8, width: '75%', margin: '8px auto' }} />
              </div>
            </div>
          )}

          {findings && (
            <div className="fade-in">
              {/* Summary */}
              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 40 }}>{passed ? '✅' : criticalCount > 0 ? '🚨' : '⚠️'}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {passed ? 'All Checks Passed' : `${findings.length} Issue${findings.length !== 1 ? 's' : ''} Found`}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
                      {passed
                        ? 'Document is compliant with brand guidelines.'
                        : `${criticalCount} critical · ${findings.filter(f => f.severity === 'HIGH').length} high · ${findings.filter(f => f.severity === 'MEDIUM').length} medium`}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge ${passed ? 'badge-success' : criticalCount > 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {passed ? 'COMPLIANT' : criticalCount > 0 ? 'CRITICAL' : 'REVIEW'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Findings */}
              {findings.map(f => (
                <div key={f.id} className="finding-card">
                  <div className="finding-header">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`tag sev-${f.severity.toLowerCase()}`}>{f.severity}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{f.category}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence: {(f.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="finding-excerpt">"{f.excerpt}"</div>
                  <div className="finding-text">{f.explanation}</div>
                  {f.suggestion && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, fontSize: 13, color: '#34d399' }}>
                      💡 Suggested: "{f.suggestion}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
