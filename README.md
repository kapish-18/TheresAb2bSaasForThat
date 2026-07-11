# There's a B2B SaaS for that.

A parody/utility search tool: type any problem (real or absurd) and find out
if there's already a B2B SaaS company solving it.

## Stack

- **Frontend**: React + Vite, React Router (for `/r/:slug` shareable results)
- **Backend**: Node + Express
- **DB**: MongoDB (Atlas free tier) + Mongoose
- **Search**: Fuse.js — fuzzy matching so typos/rephrasing still find the right entry

## Folder structure

```
theresab2bsaas/
├── client/     # React frontend
├── server/     # Express backend + MongoDB models + seed data
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 tier is enough) — or local MongoDB if you prefer

### 2. Install everything
```bash
npm run install:all
```

### 3. Configure the backend
```bash
cd server
cp .env.example .env
# edit .env and paste in your MongoDB connection string
```

### 4. Seed the database
```bash
npm run seed
```
This loads `server/src/seed/seedData.json` into MongoDB. **This is the file
you'll edit constantly as you add more problems/competitors** — no need to
touch any logic code to add content.

### 5. Run everything
From the root folder:
```bash
npm run dev
```
This runs the backend on `http://localhost:5000` and the frontend on
`http://localhost:5173` at the same time.

## Adding new entries

Open `server/src/seed/seedData.json` and add a new object following the
existing shape:

```json
{
  "text": "The problem, phrased naturally",
  "slug": "url-friendly-slug",
  "keywords": ["a few", "alternate phrasings", "someone might search"],
  "competitors": [
    {
      "name": "Company Name",
      "description": "Punchy one-liner in your voice, not their official tagline.",
      "url": "https://company.com",
      "isReal": true
    }
  ]
}
```

For satirical/gag entries, set `"isReal": false` and `"url": null` — the
frontend will show a "satirical" badge and swap the link for a Google search
instead of a dead link.

After editing, re-run `npm run seed` to reload the database. (Note: this
wipes and reinserts everything — fine for now while you're solo-curating,
but worth revisiting once real users can submit entries.)

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/problems/search?q=coffee&satire=true` | Fuzzy search |
| GET | `/api/problems/random?satire=true` | Random problem |
| GET | `/api/problems/slug/:slug` | Fetch by slug (for shareable links) |

## Deployment (when ready)

- Frontend → Vercel
- Backend → Render or Railway
- DB → MongoDB Atlas (already using this in dev)

Set `VITE_API_BASE` as an environment variable on Vercel pointing to your
deployed backend URL.

## Not built yet (intentionally deferred)

- Crowdsourced submissions / "suggest a competitor" form
- OG image generation for shared links
- Ads / sponsored placement
- Admin dashboard

These come after the core product proves it's actually funny and people use
it — see the roadmap discussion for reasoning.
