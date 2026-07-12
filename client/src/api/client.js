const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Share links point at the backend's /share/:slug route (not the frontend
// directly) because that's the URL that needs to serve real OG meta tags
// to crawlers. Derived by stripping the trailing /api from API_BASE.
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function getShareUrl(slug) {
  return `${BACKEND_ORIGIN}/share/${slug}`;
}

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

export async function fetchTrending(limit = 10) {
  const res = await fetch(`${API_BASE}/problems/trending?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load trending problems');
  const data = await res.json();
  return data.problems;
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

// --- Admin functions: all require the admin secret, sent as a header ---

async function adminFetch(path, secret, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'x-admin-secret': secret,
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function fetchSubmissions(secret, status = 'pending') {
  const data = await adminFetch(`/submissions?status=${status}`, secret);
  return data.submissions;
}

export async function approveSubmission(secret, id) {
  return adminFetch(`/submissions/${id}/approve`, secret, { method: 'POST' });
}

export async function rejectSubmission(secret, id) {
  return adminFetch(`/submissions/${id}/reject`, secret, { method: 'POST' });
}
