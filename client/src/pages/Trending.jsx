import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTrending } from '../api/client';
import EmptyState from '../components/EmptyState';
import Credits from '../components/Credits';

export default function Trending() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrending(20)
      .then(setProblems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="wrap">
      <header>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          There's a <span>B2B SaaS</span> for that.
        </Link>
        <Link to="/" className="share-btn" style={{ textDecoration: 'none' }}>
          ← back to search
        </Link>
      </header>

      <p className="tagline">The internet's favorite absurd problems, ranked by how often they've come up.</p>

      {loading && <EmptyState message="loading the leaderboard..." />}
      {error && <div className="suggest-error" style={{ marginTop: '24px' }}>{error}</div>}
      {!loading && !error && problems.length === 0 && (
        <EmptyState message="nobody's rolled the dice yet — be the first" />
      )}

      <div className="trending-list">
        {problems.map((p, i) => (
          <Link to={`/r/${p.slug}`} className="trending-row" key={p.slug}>
            <span className="trending-rank">#{i + 1}</span>
            <div className="trending-body">
              <div className="trending-text">"{p.text}"</div>
              <div className="trending-meta">
                {(p.competitors || []).length} business{(p.competitors || []).length === 1 ? '' : 'es'} found
              </div>
            </div>
            <span className="trending-count">{p.viewCount} views</span>
          </Link>
        ))}
      </div>

      <Credits />
    </div>
  );
}
