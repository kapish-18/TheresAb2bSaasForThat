# There's a B2B SaaS for that. 🎲

**Type any problem. Find out if a venture-backed startup already solves it.**

Spoiler: it probably does.

There are more B2B SaaS companies right now than there are problems worth solving — this is a search engine for proving it. Roll the dice for a random workplace absurdity, or search your own, and see how "saturated" the space already is. Some results are real, funded companies. Some are jokes. You'll know which is which.

🔗 **[Live demo](#)** &nbsp;·&nbsp; 🎲 **[Try a random roll](#)**

---

## How it works

- **🎲 Roll the dice** — get a random real-or-absurd workplace problem
- **🔍 Search your own** — fuzzy search handles typos and rephrasing, not just exact matches
- **Every result** shows how many companies solve it, a `verified` vs `satirical` badge per competitor, and a saturation score
- **Share any result** — every problem has a shareable link with a proper social preview card (real Open Graph image, generated on the fly)
- **See what's trending** — a live leaderboard of the most-rolled, most-searched problems
- **Missing something?** — suggest a competitor or a brand new problem right from the result card; submissions go into a review queue before going live

## Screenshot

*(add a screenshot or GIF of the dice roll + result card here)*

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router |
| Backend | Node + Express |
| Database | MongoDB (Atlas) + Mongoose |
| Fuzzy search | [Fuse.js](https://www.fusejs.io/) |
| OG image generation | [Satori](https://github.com/vercel/satori) + [resvg](https://github.com/thx/resvg-js) — real PNG cards rendered server-side, no headless browser |
| Rate limiting | express-rate-limit |

No framework lock-in, no SSR complexity — a plain SPA plus a small Express API, with a bot-aware share endpoint to solve the "SPAs can't have per-page social previews" problem (see [Architecture notes](#architecture-notes) below).

---

## Project structure

```
theresab2bsaas/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # SearchBar, DiceButton, ResultCard, SuggestForm, etc.
│       ├── pages/          # Home, Trending, Admin, SharedResult
│       └── api/            # backend API client
├── server/                 # Express backend
│   └── src/
│       ├── models/         # Problem, Submission (Mongoose schemas)
│       ├── routes/         # problems, submissions, share/OG image
│       ├── controllers/    # request handlers
│       ├── services/       # search (Fuse.js) + OG image rendering (Satori)
│       └── seed/           # seedData.json — the actual problem/competitor content
```

---

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string ([Atlas free tier](https://www.mongodb.com/cloud/atlas/register) works fine, or run Mongo locally)

### Install
```bash
git clone https://github.com/kapish-18/TheresAb2bSaasForThat.git
cd TheresAb2bSaasForThat
npm run install:all
```

### Configure
```bash
cd server
cp .env.example .env
```
Fill in `server/.env`:

| Variable | What it's for |
|---|---|
| `MONGO_URI` | Your MongoDB connection string |
| `PORT` | Backend port (defaults to 5000) |
| `ADMIN_SECRET` | A long random string — gates the `/admin` review panel |
| `FRONTEND_URL` | Where the React app is served (used for share-link redirects) |
| `BACKEND_URL` | Where this API is served (used to build OG image URLs) |

### Seed the database
```bash
npm run seed
```
Loads `server/src/seed/seedData.json` into MongoDB. This file is the actual content of the site — edit it directly to add problems and competitors, no code changes needed.

### Run it
```bash
npm run dev
```
Backend on `:5000`, frontend on `:5173`, both at once.

---

## Adding content

Every entry in `server/src/seed/seedData.json` looks like this:

```json
{
  "text": "The problem, phrased naturally",
  "slug": "url-friendly-slug",
  "keywords": ["alternate phrasings", "someone might search"],
  "competitors": [
    {
      "name": "Company Name",
      "description": "A punchy one-liner in your own voice — not their marketing copy.",
      "url": "https://company.com",
      "isReal": true
    }
  ]
}
```

Satirical/joke entries: set `"isReal": false` and `"url": null`. The frontend shows a `satirical` badge and swaps the link for a search instead of a dead URL.

Re-run `npm run seed` after editing (this wipes and reloads all problems — fine solo, and submissions go through the review queue instead once real users are involved).

---

## The admin panel

Visit `/admin` in the running app, paste in your `ADMIN_SECRET`, and you'll get a queue of community-suggested competitors/problems to approve or reject. Approved submissions merge straight into the live database.

This is secret-gated, not a real login system — fine for a solo maintainer, not meant to scale past that without upgrading to real auth.

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/problems/search?q=coffee&satire=true` | Fuzzy search |
| `GET` | `/api/problems/random?satire=true` | Random problem |
| `GET` | `/api/problems/trending?limit=10` | Most-viewed problems |
| `GET` | `/api/problems/slug/:slug` | Fetch one problem by slug |
| `POST` | `/api/submissions` | Suggest a competitor or new problem (rate-limited) |
| `GET` | `/api/submissions?status=pending` | 🔒 Admin: list submissions |
| `POST` | `/api/submissions/:id/approve` | 🔒 Admin: approve |
| `POST` | `/api/submissions/:id/reject` | 🔒 Admin: reject |
| `GET` | `/api/og/:slug.png` | Generated OG image for a problem |
| `GET` | `/share/:slug` | Bot-readable share page → redirects humans to the app |

🔒 = requires an `x-admin-secret` header matching `ADMIN_SECRET`.

---

## Architecture notes

**Why is there a `/share/:slug` route separate from the frontend's `/r/:slug`?**

Social crawlers (Twitter, LinkedIn, Slack, Discord) don't execute JavaScript — they only read `<meta>` tags from the raw HTML response. A client-side React SPA can't serve per-problem preview cards no matter what's in the component, because the crawler never runs the code that would render them.

The fix: `/share/:slug` is a small Express route that checks the requester's user-agent. Bots get plain HTML with correct `og:image`/`og:title` tags and nothing else. Humans get an instant redirect into the real React app. The "copy link" button in the UI copies this URL, not the raw frontend one.

---

## Deployment

- **Frontend** → [Vercel](https://vercel.com) (set `VITE_API_BASE` env var to your deployed backend's `/api` URL)
- **Backend** → [Render](https://render.com) or [Railway](https://railway.app) (set all the `server/.env` variables in the platform's dashboard — remember to update `FRONTEND_URL` and `BACKEND_URL` to the real deployed URLs, not localhost)
- **Database** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Roadmap / not built yet

- Sponsored placement slots (deliberately deferred until there's real traffic to sell against)
- Real auth for the admin panel, if more than one person starts moderating
- Analytics beyond the trending leaderboard

---

## Contributing

Found a niche that's suspiciously saturated? Open a PR against `seedData.json`, or use the in-app "suggest a competitor" button once it's deployed — either works.

## License

MIT — see [LICENSE](./LICENSE).

---

Built by [Kapish](https://github.com/kapish-18).
