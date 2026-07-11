import { useState } from 'react';
import { submitSuggestion } from '../api/client';

// mode: 'competitor' (adding to an existing problem) or 'problem' (suggesting a brand new one)
export default function SuggestForm({ mode, problemSlug, problemTextSeed, onClose }) {
  const [problemText, setProblemText] = useState(problemTextSeed || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isReal, setIsReal] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitSuggestion({
        type: mode === 'competitor' ? 'new_competitor' : 'new_problem',
        problemSlug: mode === 'competitor' ? problemSlug : undefined,
        problemText: mode === 'problem' ? problemText.trim() : undefined,
        competitorName: name.trim(),
        competitorDescription: description.trim(),
        competitorUrl: url.trim() || null,
        isReal
      });
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  if (status === 'done') {
    return (
      <div className="suggest-form">
        <div className="suggest-done">
          submitted — thanks! it'll show up once it's reviewed.
        </div>
        <button className="share-btn" onClick={onClose}>close</button>
      </div>
    );
  }

  return (
    <form className="suggest-form" onSubmit={handleSubmit}>
      <div className="suggest-title">
        {mode === 'competitor' ? 'suggest a competitor' : 'suggest a problem'}
      </div>

      {mode === 'problem' && (
        <label className="suggest-label">
          the problem
          <textarea
            className="suggest-input"
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="describe the problem, naturally"
            required
          />
        </label>
      )}

      <label className="suggest-label">
        company / business name
        <input
          className="suggest-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Robin"
          required
        />
      </label>

      <label className="suggest-label">
        one-liner (your voice, not their tagline)
        <textarea
          className="suggest-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="short, punchy, mildly funny"
          required
        />
      </label>

      <label className="suggest-label">
        website (optional)
        <input
          className="suggest-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </label>

      <label className="suggest-checkbox-row">
        <input type="checkbox" checked={isReal} onChange={(e) => setIsReal(e.target.checked)} />
        this is a real company (uncheck if it's a joke)
      </label>

      {status === 'error' && <div className="suggest-error">{errorMsg}</div>}

      <div className="suggest-actions">
        <button type="button" className="share-btn" onClick={onClose}>cancel</button>
        <button type="submit" className="share-btn primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'submitting...' : 'submit'}
        </button>
      </div>
    </form>
  );
}
