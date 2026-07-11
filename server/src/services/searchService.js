const Fuse = require('fuse.js');
const Problem = require('../models/Problem');

// Fuse.js options tuned for short, casual queries against problem text + keywords.
// threshold: 0 = exact match only, 1 = matches anything.
//
// These numbers (0.65 / 0.63) were reached by testing against the seed set,
// not guessed: they're the tightest cutoff that still catches real typos
// ("zoomm backround", "slak messages") while rejecting unrelated queries
// ("parking spot", "bad wifi"). Fuse's `threshold` alone wasn't a strict
// enough gate on its own, so we double-filter by score explicitly below.
//
// IMPORTANT: this balance is dataset-dependent. As you add more entries,
// re-run a quick sanity check (a handful of "should match" and "should not
// match" queries) — more entries means more vocabulary overlap, which can
// shift what counts as a false positive.
const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.65,
  keys: [
    { name: 'text', weight: 0.6 },
    { name: 'keywords', weight: 0.4 }
  ]
};

const MAX_ACCEPTABLE_SCORE = 0.63;

let cachedFuse = null;
let cacheBuiltAt = 0;
const CACHE_TTL_MS = 60 * 1000; // rebuild index at most once a minute

async function getFuseIndex() {
  const now = Date.now();
  if (cachedFuse && now - cacheBuiltAt < CACHE_TTL_MS) {
    return cachedFuse;
  }
  const allProblems = await Problem.find({}).lean();
  cachedFuse = new Fuse(allProblems, FUSE_OPTIONS);
  cacheBuiltAt = now;
  return cachedFuse;
}

async function searchProblems(query, { includeSatire = true, limit = 1 } = {}) {
  const fuse = await getFuseIndex();
  const results = fuse.search(query, { limit: limit * 3 }); // over-fetch, then filter

  const filtered = results
    .filter((r) => r.score !== undefined && r.score <= MAX_ACCEPTABLE_SCORE)
    .map((r) => r.item)
    .map((problem) => {
      if (includeSatire) return problem;
      const realOnly = problem.competitors.filter((c) => c.isReal);
      return realOnly.length ? { ...problem, competitors: realOnly } : null;
    })
    .filter(Boolean);

  return filtered.slice(0, limit);
}

async function getRandomProblem({ includeSatire = true } = {}) {
  const filter = includeSatire ? {} : { 'competitors.isReal': true };
  const count = await Problem.countDocuments(filter);
  if (count === 0) return null;
  const skip = Math.floor(Math.random() * count);
  const problem = await Problem.findOne(filter).skip(skip).lean();
  if (!includeSatire && problem) {
    problem.competitors = problem.competitors.filter((c) => c.isReal);
  }
  return problem;
}

module.exports = { searchProblems, getRandomProblem };
