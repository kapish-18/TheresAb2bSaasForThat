import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import EmptyState from '../components/EmptyState';
import { getProblemBySlug } from '../api/client';

export default function SharedResult() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProblemBySlug(slug).then((p) => {
      setProblem(p);
      setLoading(false);
    });
  }, [slug]);

  return (
    <div className="wrap">
      <header>
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          There's a <span>B2B SaaS</span> for that.
        </Link>
      </header>

      <div className="result-zone">
        {loading && <EmptyState message="loading..." />}
        {!loading && problem && <ResultCard problem={problem} />}
        {!loading && !problem && <EmptyState message="this problem doesn't exist. someone probably made this URL up." />}
      </div>
    </div>
  );
}
