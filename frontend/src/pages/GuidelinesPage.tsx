import React, { useState, useEffect } from 'react';
import { brandsApi, type BrandGuidelineItem, type ApprovedFactItem } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function GuidelinesPage() {
  const { role, activeBrandProfileId } = useAuth();
  const [tab, setTab] = useState<'guidelines' | 'facts'>('guidelines');
  const [guidelines, setGuidelines] = useState<BrandGuidelineItem[]>([]);
  const [facts, setFacts] = useState<ApprovedFactItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  // Add Guideline Modal
  const [showAddGModal, setShowAddGModal] = useState<boolean>(false);
  const [newClauseId, setNewClauseId] = useState<string>('');
  const [newClauseText, setNewClauseText] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('TERMINOLOGY');
  const [newSeverity, setNewSeverity] = useState<string>('HIGH');
  const [addingG, setAddingG] = useState<boolean>(false);

  // Add Fact Modal
  const [showAddFModal, setShowAddFModal] = useState<boolean>(false);
  const [newFactStatement, setNewFactStatement] = useState<string>('');
  const [newSourceUrl, setNewSourceUrl] = useState<string>('');
  const [newEvidence, setNewEvidence] = useState<string>('');
  const [newExpiry, setNewExpiry] = useState<string>('2027-12-31');
  const [addingF, setAddingF] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gList, fList] = await Promise.all([
        brandsApi.getGuidelines(activeBrandProfileId).catch(() => []),
        brandsApi.listFacts().catch(() => []),
      ]);
      setGuidelines(gList || []);
      setFacts(fList || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load brand guidelines from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, activeBrandProfileId]);

  const handleCreateGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClauseId || !newClauseText) return;
    setAddingG(true);
    try {
      // Generate a mock normalized 1536-dim vector for indexing
      const embedding = Array(1536).fill(0.01);
      await brandsApi.createGuideline(activeBrandProfileId, {
        clause_identifier: newClauseId,
        clause_text: newClauseText,
        category: newCategory,
        severity: newSeverity,
        embedding,
      });
      setShowAddGModal(false);
      setNewClauseId('');
      setNewClauseText('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to create guideline: ${err.message}`);
    } finally {
      setAddingG(false);
    }
  };

  const handleCreateFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactStatement || !newSourceUrl) return;
    setAddingF(true);
    try {
      const embedding = Array(1536).fill(0.01);
      const now = new Date().toISOString();
      await brandsApi.createFact({
        fact_statement: newFactStatement,
        original_source_url: newSourceUrl,
        evidence_excerpt: newEvidence || newFactStatement,
        verification_date: now,
        expiry_date: new Date(newExpiry).toISOString(),
        responsible_owner_id: '201a2561-e7b9-4f3d-b2f8-d93624575292', // Sam Admin
        embedding,
      });
      setShowAddFModal(false);
      setNewFactStatement('');
      setNewSourceUrl('');
      setNewEvidence('');
      await fetchData();
    } catch (err: any) {
      setError(`Failed to create fact: ${err.message}`);
    } finally {
      setAddingF(false);
    }
  };

  const now = new Date();

  const filteredGuidelines = guidelines.filter(
    (g) =>
      g.clause_identifier.toLowerCase().includes(search.toLowerCase()) ||
      g.clause_text.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFacts = facts.filter(
    (f) =>
      f.fact_statement.toLowerCase().includes(search.toLowerCase()) ||
      f.original_source_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Brand Guidelines &amp; Ground-Truth Facts</h1>
          <p>Normative compliance clauses, regulatory directives, and temporally bounded approved corporate facts.</p>
        </div>
        {role === 'ADMINISTRATOR' && (
          <div style={{ display: 'flex', gap: 10 }}>
            {tab === 'guidelines' ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddGModal(true)}>
                + Add Guideline Clause
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddFModal(true)}>
                + Add Approved Fact
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: 14, borderRadius: 8, marginBottom: 20, color: '#fca5a5' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--glass-border)', paddingBottom: 10 }}>
        <button
          className={`btn btn-sm ${tab === 'guidelines' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('guidelines')}
        >
          Brand Guidelines ({guidelines.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'facts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('facts')}
        >
          Approved Temporal Facts ({facts.length})
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-wrapper" style={{ flex: 1 }}>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder={tab === 'guidelines' ? 'Search guidelines by clause or text…' : 'Search approved facts…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchData}>
          Refresh
        </button>
      </div>

      {/* Tab 1: Guidelines Table */}
      {tab === 'guidelines' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Clause Identifier</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Directive Text</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    Loading indexed guidelines from database…
                  </td>
                </tr>
              ) : filteredGuidelines.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No guidelines matched the query.
                  </td>
                </tr>
              ) : (
                filteredGuidelines.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>
                        {g.clause_identifier}
                      </span>
                    </td>
                    <td>
                      <span className="tag">{g.category}</span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: g.severity === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : g.severity === 'HIGH' ? 'rgba(249,115,22,0.2)' : 'rgba(245,158,11,0.2)',
                          color: g.severity === 'CRITICAL' ? '#f87171' : g.severity === 'HIGH' ? '#fb923c' : '#fbbf24',
                        }}
                      >
                        {g.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-primary)', maxWidth: 440 }}>
                      {g.clause_text}
                    </td>
                    <td>
                      <span className={`badge ${g.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {g.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Facts Table */}
      {tab === 'facts' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Factual Claim Statement</th>
                <th>Provenance Source URL</th>
                <th>Verification Date</th>
                <th>Expiry Date</th>
                <th>Temporal Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    Loading certified facts from database…
                  </td>
                </tr>
              ) : filteredFacts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                    No approved facts matched the query.
                  </td>
                </tr>
              ) : (
                filteredFacts.map((f) => {
                  const isExpired = new Date(f.expiry_date) < now;
                  return (
                    <tr key={f.id}>
                      <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 360 }}>
                        {f.fact_statement}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          "{f.evidence_excerpt}"
                        </div>
                      </td>
                      <td>
                        <a
                          href={f.original_source_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: '#38bdf8', textDecoration: 'none' }}
                        >
                          {f.original_source_url.length > 35 ? f.original_source_url.substring(0, 32) + '…' : f.original_source_url}
                        </a>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {new Date(f.verification_date).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: 12, color: isExpired ? '#f87171' : '#34d399', fontWeight: 600 }}>
                        {new Date(f.expiry_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
                          {isExpired ? 'STALE / EXPIRED' : 'ACTIVE TRUTH'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Guideline Modal */}
      {showAddGModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card" style={{ maxWidth: 540, width: '100%' }}>
            <div className="card-title" style={{ marginBottom: 14 }}>+ Add Compliance Guideline</div>
            <form onSubmit={handleCreateGuideline}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Clause Identifier</label>
                <input
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 10 }}
                  placeholder="e.g. SEC-TONE-05"
                  value={newClauseId}
                  onChange={(e) => setNewClauseId(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                  <select className="form-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="TERMINOLOGY">TERMINOLOGY</option>
                    <option value="TONE">TONE</option>
                    <option value="MESSAGING">MESSAGING</option>
                    <option value="ACCESSIBILITY">ACCESSIBILITY</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Severity</label>
                  <select className="form-select" value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)}>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Directive Text</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 100, width: '100%' }}
                  placeholder="Specify mandatory policy rule…"
                  value={newClauseText}
                  onChange={(e) => setNewClauseText(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddGModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingG}>
                  {addingG ? 'Saving…' : 'Save Guideline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fact Modal */}
      {showAddFModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card" style={{ maxWidth: 540, width: '100%' }}>
            <div className="card-title" style={{ marginBottom: 14 }}>+ Add Approved Corporate Fact</div>
            <form onSubmit={handleCreateFact}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fact Statement</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 70, width: '100%' }}
                  placeholder="e.g. Acme FinTech maintains $500M in FDIC-insured institutional custody reserves."
                  value={newFactStatement}
                  onChange={(e) => setNewFactStatement(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Source URL</label>
                <input
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 10 }}
                  placeholder="https://acmefintech.com/regulatory/audits/q2-2026.pdf"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Expiry Date</label>
                <input
                  type="date"
                  className="search-input"
                  style={{ width: '100%', paddingLeft: 10 }}
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddFModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingF}>
                  {addingF ? 'Saving…' : 'Save Fact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
