const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export async function searchProblem(query, includeSatire) {
  const url = `${API_BASE}/problems/search?q=${encodeURIComponent(query)}&satire=${includeSatire}`;
  const res = await fetch(url);
  if (res.status === 404) return { found: false };
  if (!res.ok) throw new Error('Search request failed');
  return res.json();
}

export async function getRandomProblem(includeSatire) {
  const url = `${API_BASE}/problems/random?satire=${includeSatire}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Random request failed');
  const data = await res.json();
  return data.problem;
}

export async function getProblemBySlug(slug) {
  const url = `${API_BASE}/problems/slug/${slug}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.problem;
}

export async function submitSuggestion(payload) {
  const res = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Submission failed');
  }
  return data;
}
