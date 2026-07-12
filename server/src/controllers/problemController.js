const Problem = require('../models/Problem');
const { searchProblems, getRandomProblem } = require('../services/searchService');

// Fire-and-forget view count increment. Doesn't block the response — the
// user gets their result immediately, the count updates in the background.
// Errors here are logged but never surfaced to the user; a failed analytics
// increment shouldn't turn into a 500 on someone's dice roll.
function trackView(slug) {
  if (!slug) return;
  Problem.updateOne({ slug }, { $inc: { viewCount: 1 } }).catch((err) => {
    console.error(`Failed to increment viewCount for "${slug}":`, err.message);
  });
}

async function search(req, res, next) {
  try {
    const { q, satire } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Query param "q" is required.' });
    }
    const includeSatire = satire !== 'false';
    const [match] = await searchProblems(q.trim(), { includeSatire, limit: 1 });
    if (!match) {
      return res.status(404).json({ found: false, query: q });
    }
    trackView(match.slug);
    res.json({ found: true, problem: match });
  } catch (err) {
    next(err);
  }
}

async function random(req, res, next) {
  try {
    const includeSatire = req.query.satire !== 'false';
    const problem = await getRandomProblem({ includeSatire });
    if (!problem) {
      return res.status(404).json({ error: 'No problems available.' });
    }
    trackView(problem.slug);
    res.json({ problem });
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).lean();
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    res.json({ problem });
  } catch (err) {
    next(err);
  }
}

async function trending(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const problems = await Problem.find({ viewCount: { $gt: 0 } })
      .sort({ viewCount: -1 })
      .limit(limit)
      .select('text slug viewCount competitors')
      .lean();
    res.json({ problems });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, random, getBySlug, trending };
