const slugify = require('../utils/slugify');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

// --- Public: create a submission ---

async function createSubmission(req, res, next) {
  try {
    const { type, problemSlug, problemText, competitorName, competitorDescription, competitorUrl, isReal, submitterNote } = req.body;

    if (!['new_competitor', 'new_problem'].includes(type)) {
      return res.status(400).json({ error: 'type must be "new_competitor" or "new_problem".' });
    }
    if (!competitorName || !competitorDescription) {
      return res.status(400).json({ error: 'competitorName and competitorDescription are required.' });
    }
    if (type === 'new_competitor' && !problemSlug) {
      return res.status(400).json({ error: 'problemSlug is required for new_competitor submissions.' });
    }
    if (type === 'new_problem' && !problemText) {
      return res.status(400).json({ error: 'problemText is required for new_problem submissions.' });
    }

    const submission = await Submission.create({
      type,
      problemSlug: type === 'new_competitor' ? problemSlug : null,
      problemText: type === 'new_problem' ? problemText.trim() : null,
      competitorName: competitorName.trim(),
      competitorDescription: competitorDescription.trim(),
      competitorUrl: competitorUrl ? competitorUrl.trim() : null,
      isReal: isReal !== false,
      submitterNote: (submitterNote || '').trim()
    });

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

// --- Admin: list pending submissions ---

async function listSubmissions(req, res, next) {
  try {
    const status = req.query.status || 'pending';
    const submissions = await Submission.find({ status }).sort({ createdAt: -1 }).lean();
    res.json({ submissions });
  } catch (err) {
    next(err);
  }
}

// --- Admin: approve a submission (merges it into Problem collection) ---

async function approveSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ error: `Submission already ${submission.status}.` });
    }

    const competitor = {
      name: submission.competitorName,
      description: submission.competitorDescription,
      url: submission.competitorUrl,
      isReal: submission.isReal
    };

    if (submission.type === 'new_competitor') {
      const problem = await Problem.findOne({ slug: submission.problemSlug });
      if (!problem) return res.status(404).json({ error: 'Target problem no longer exists.' });
      problem.competitors.push(competitor);
      await problem.save();
    } else {
      const slug = slugify(submission.problemText);
      const existing = await Problem.findOne({ slug });
      if (existing) {
        existing.competitors.push(competitor);
        await existing.save();
      } else {
        await Problem.create({
          text: submission.problemText,
          slug,
          keywords: [],
          competitors: [competitor]
        });
      }
    }

    submission.status = 'approved';
    await submission.save();
    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

// --- Admin: reject a submission ---

async function rejectSubmission(req, res, next) {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    if (submission.status !== 'pending') {
      return res.status(400).json({ error: `Submission already ${submission.status}.` });
    }
    submission.status = 'rejected';
    await submission.save();
    res.json({ submission });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSubmission, listSubmissions, approveSubmission, rejectSubmission };
