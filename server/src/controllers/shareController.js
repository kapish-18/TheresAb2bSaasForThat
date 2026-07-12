const Problem = require('../models/Problem');
const { renderOgImagePng } = require('../services/ogImageService');

// Simple in-memory cache: OG images are deterministic per problem and don't
// need to be regenerated on every crawler hit. Keyed by slug, cleared if
// the process restarts (fine — regenerating is cheap, a few hundred ms).
const imageCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getOgImage(req, res, next) {
  try {
    const { slug } = req.params;
    const cached = imageCache.get(slug);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      res.set('Content-Type', 'image/png');
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(cached.buffer);
    }

    const problem = await Problem.findOne({ slug }).lean();
    if (!problem) return res.status(404).send('Not found');

    const buffer = await renderOgImagePng(problem);
    imageCache.set(slug, { buffer, at: Date.now() });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

// Crawlers (Twitter/LinkedIn/Slack/Discord/etc) don't execute JS, so they
// only ever see whatever HTML this route returns directly — they never
// reach the React app. Real humans get bounced to the actual interactive
// app almost instantly via a meta-refresh + JS redirect (belt and braces).
function isLikelyBot(userAgent = '') {
  return /bot|crawl|spider|facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp|telegrambot/i.test(userAgent);
}

async function getSharePage(req, res, next) {
  try {
    const { slug } = req.params;
    const problem = await Problem.findOne({ slug }).lean();

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendBase = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const targetUrl = `${frontendBase}/r/${slug}`;

    if (!problem) {
      // Still redirect humans even if the problem vanished; bots get a 404.
      if (isLikelyBot(req.headers['user-agent'])) return res.status(404).send('Not found');
      return res.redirect(302, frontendBase);
    }

    const competitorCount = (problem.competitors || []).length;
    const title = `"${problem.text}" — There's a B2B SaaS for that.`;
    const description = `${competitorCount} business${competitorCount === 1 ? '' : 'es'} found solving this. See who.`;
    const imageUrl = `${backendBase}/api/og/${slug}.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${backendBase}/share/${slug}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <meta http-equiv="refresh" content="0; url=${targetUrl}" />
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${targetUrl}">${escapeHtml(targetUrl)}</a>...</p>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    next(err);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { getOgImage, getSharePage };
