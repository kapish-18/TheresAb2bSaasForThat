const Problem = require('../models/Problem');
const { searchProblems, getRandomProblem } = require('../services/searchService');

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

module.exports = { search, random, getBySlug };
