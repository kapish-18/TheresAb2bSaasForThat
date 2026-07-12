import { useState } from 'react';
import SuggestForm from './SuggestForm';
import { getShareUrl } from '../api/client';

function verdictFor(count) {
  if (count === 0) return 'clean slate — go build it';
  if (count === 1) return 'someone already did this';
  if (count === 2) return 'a quiet little rivalry';
  return 'fully saturated, good luck';
}

export default function ResultCard({ problem }) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [copied, setCopied] = useState(false);
  const competitors = problem.competitors || [];
  const count = competitors.length;

  function handleCopyLink() {
    const url = getShareUrl(problem.slug);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  return (
    <div className="problem-card">
      <div className="problem-label">your problem</div>
      <div className="problem-text">"{problem.text}"</div>

      <div className="comp-count-row">
        <span className="comp-count">
          {count} business{count === 1 ? '' : 'es'} found
        </span>
        <div className="saturation">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`sat-block${i < Math.min(count, 5) ? ' filled' : ''}`} />
          ))}
        </div>
      </div>

      {count === 0 && (
        <div className="empty-hint" style={{ padding: '24px' }}>
          nothing verified yet — try including satire
        </div>
      )}

      {competitors.map((c, i) => (
        <div className="competitor" key={i}>
          <div className="comp-left">
            <div className="comp-name-row">
              <span className="comp-name">{c.name}</span>
              <span className={`badge ${c.isReal ? 'verified' : 'satirical'}`}>
                {c.isReal ? 'verified' : 'satirical'}
              </span>
            </div>
            <div className="comp-desc">{c.description}</div>
          </div>
          <a
            className="comp-link"
            href={c.url || `https://www.google.com/search?q=${encodeURIComponent(c.name)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.url ? 'visit ↗' : 'search ↗'}
          </a>
        </div>
      ))}

      <div className="card-footer">
        <span className="verdict">verdict: {verdictFor(count)}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="share-btn" onClick={() => setShowSuggest((v) => !v)}>
            know one we missed?
          </button>
          <button className="share-btn" onClick={handleCopyLink}>
            {copied ? 'copied ✓' : 'copy link'}
          </button>
        </div>
      </div>

      {showSuggest && (
        <SuggestForm
          mode="competitor"
          problemSlug={problem.slug}
          onClose={() => setShowSuggest(false)}
        />
      )}
    </div>
  );
}
