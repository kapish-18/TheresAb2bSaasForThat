import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchSubmissions, approveSubmission, rejectSubmission } from '../api/client';

const SECRET_STORAGE_KEY = 'b2bsaas_admin_secret';

export default function Admin() {
  const [secret, setSecret] = useState(localStorage.getItem(SECRET_STORAGE_KEY) || '');
  const [secretInput, setSecretInput] = useState('');
  const [status, setStatus] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  const load = useCallback(async () => {
    if (!secret) return;
    setLoading(true);
    setError('');
    try {
      const results = await fetchSubmissions(secret, status);
      setSubmissions(results);
    } catch (err) {
      if (err.status === 401) {
        setError('Wrong secret. Clearing saved key — try again.');
        localStorage.removeItem(SECRET_STORAGE_KEY);
        setSecret('');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [secret, status]);

  useEffect(() => {
    load();
  }, [load]);

  function handleUnlock(e) {
    e.preventDefault();
    if (!secretInput.trim()) return;
    localStorage.setItem(SECRET_STORAGE_KEY, secretInput.trim());
    setSecret(secretInput.trim());
  }

  function handleLogout() {
    localStorage.removeItem(SECRET_STORAGE_KEY);
    setSecret('');
    setSubmissions([]);
  }

  async function handleApprove(id) {
    setActioningId(id);
    try {
      await approveSubmission(secret, id);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(`Approve failed: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id) {
    setActioningId(id);
    try {
      await rejectSubmission(secret, id);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(`Reject failed: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  }

  if (!secret) {
    return (
      <div className="wrap">
        <header>
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            There's a <span>B2B SaaS</span> for that.
          </Link>
        </header>
        <form className="suggest-form" onSubmit={handleUnlock} style={{ marginTop: '40px', maxWidth: '400px' }}>
          <div className="suggest-title">admin access</div>
          <label className="suggest-label">
            admin secret
            <input
              type="password"
              className="suggest-input"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="paste your ADMIN_SECRET"
              autoFocus
            />
          </label>
          <div className="suggest-actions">
            <button type="submit" className="share-btn primary">unlock</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="wrap">
      <header>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          There's a <span>B2B SaaS</span> for that.
        </Link>
        <button className="share-btn" onClick={handleLogout}>lock</button>
      </header>

      <div className="admin-tabs">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            className={`admin-tab${status === s ? ' active' : ''}`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <div className="empty-hint" style={{ marginTop: '24px' }}>loading...</div>}
      {error && <div className="suggest-error" style={{ marginTop: '24px' }}>{error}</div>}

      {!loading && !error && submissions.length === 0 && (
        <div className="empty-hint" style={{ marginTop: '24px' }}>no {status} submissions</div>
      )}

      <div className="admin-list">
        {submissions.map((s) => (
          <div className="admin-card" key={s._id}>
            <div className="admin-card-type">
              {s.type === 'new_competitor' ? 'competitor for existing problem' : 'brand new problem'}
            </div>
            <div className="problem-text" style={{ fontSize: '16px', marginBottom: '10px' }}>
              "{s.resolvedProblemText}"
            </div>
            <div className="comp-name-row">
              <span className="comp-name">{s.competitorName}</span>
              <span className={`badge ${s.isReal ? 'verified' : 'satirical'}`}>
                {s.isReal ? 'real' : 'satirical'}
              </span>
            </div>
            <div className="comp-desc" style={{ marginBottom: '8px' }}>{s.competitorDescription}</div>
            {s.competitorUrl && (
              <a className="comp-link" href={s.competitorUrl} target="_blank" rel="noopener noreferrer">
                {s.competitorUrl}
              </a>
            )}
            {s.submitterNote && (
              <div className="admin-note">note from submitter: {s.submitterNote}</div>
            )}

            {status === 'pending' && (
              <div className="suggest-actions" style={{ marginTop: '14px' }}>
                <button
                  className="share-btn"
                  disabled={actioningId === s._id}
                  onClick={() => handleReject(s._id)}
                >
                  reject
                </button>
                <button
                  className="share-btn primary"
                  disabled={actioningId === s._id}
                  onClick={() => handleApprove(s._id)}
                >
                  approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
