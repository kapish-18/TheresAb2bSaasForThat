import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SatireToggle from '../components/SatireToggle';
import ResultCard from '../components/ResultCard';
import EmptyState from '../components/EmptyState';
import SuggestForm from '../components/SuggestForm';
import { searchProblem, getRandomProblem } from '../api/client';

export default function Home() {
  const [includeSatire, setIncludeSatire] = useState(true);
  const [query, setQuery] = useState('');
  const [problem, setProblem] = useState(null);
  const [notFoundQuery, setNotFoundQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestNew, setShowSuggestNew] = useState(false);

  async function handleSearch(q) {
    if (!q.trim()) {
      setProblem(null);
      setNotFoundQuery(null);
      return;
    }
    setLoading(true);
    setNotFoundQuery(null);
    setShowSuggestNew(false);
    try {
      const result = await searchProblem(q, includeSatire);
      if (result.found) {
        setProblem(result.problem);
      } else {
        setProblem(null);
        setNotFoundQuery(q);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoll() {
    setLoading(true);
    setQuery('');
    setNotFoundQuery(null);
    setShowSuggestNew(false);
    try {
      const result = await getRandomProblem(includeSatire);
      setProblem(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleChange(checked) {
    setIncludeSatire(checked);
    if (query.trim()) handleSearch(query);
  }

  return (
    <div className="wrap">
      <header>
        <div className="logo">
          There's a <span>B2B SaaS</span> for that.
        </div>
        <SatireToggle checked={includeSatire} onChange={handleToggleChange} />
      </header>

      <p className="tagline">
        Type a problem. Any problem. We'll tell you if someone's already raised a seed round to solve it.
      </p>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        onRoll={handleRoll}
      />
      <div className="hint-row">press the dice for a random problem, or search your own</div>

      <div className="result-zone">
        {loading && <EmptyState message="rolling..." />}
        {!loading && problem && <ResultCard problem={problem} />}
        {!loading && !problem && notFoundQuery && (
          <div className="problem-card">
            <div className="problem-label">your problem</div>
            <div className="problem-text">"{notFoundQuery}"</div>
            <div className="empty-hint" style={{ padding: '32px 16px' }}>
              no B2B SaaS for that yet 👀
              <br />
              <span style={{ fontSize: '12px' }}>
                (that might mean you have a billion dollar idea, or nobody's that bored. flip a coin.)
              </span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button className="share-btn" onClick={() => setShowSuggestNew((v) => !v)}>
                know one that solves this?
              </button>
            </div>
            {showSuggestNew && (
              <SuggestForm
                mode="problem"
                problemTextSeed={notFoundQuery}
                onClose={() => setShowSuggestNew(false)}
              />
            )}
          </div>
        )}
        {!loading && !problem && !notFoundQuery && (
          <EmptyState message="roll the dice or search above — your result shows up here" />
        )}
      </div>

      <div className="disclaimer">
        disclaimer: some results are real companies, some are jokes, all one-liners are editorialized
        for comedic effect and not official taglines. don't take offense, don't raise a seed round
        based on this website, and don't sue us. we're a comedy bit that occasionally tells the truth.
      </div>
    </div>
  );
}
