# Stackt

Stackt is a training app for hybrid athletes — people juggling multiple
disciplines and race goals at once (think HYROX, an endurance race, and
ongoing strength work in the same training block). It helps you log sessions
across disciplines, flags recovery conflicts before they become injuries, and
uses AI to help you decide what to prioritize when your schedule and your
body disagree.

**Live app:** [stackt-app-five.vercel.app](https://stackt-app-five.vercel.app)

## Key features

- **Multi-discipline session logging** — strength, run, bike, swim, and WOD/HYROX-style
  workouts, each with the fields relevant to that discipline (sets/reps, distance/pace,
  rounds/movements).
- **Conflict-flagging** — automatically surfaces when two sessions load the same body
  area without enough recovery in between, factoring in recent training frequency
  rather than a fixed rest-hours rule. Intentionally linked sessions (e.g. a triathlon
  brick) are exempt by design.
- **Prioritization Assistant** — an AI-powered check-in that weighs your available time,
  physical state, and mental/stress state (rated separately, since they don't always
  agree) against your recovery capacity, injury history, upcoming races, and recent
  training load, then recommends what to do with your next session — with full
  reasoning shown, not a black-box answer.

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), built with [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) (v4, CSS-first theme)
- [Vercel](https://vercel.com/) for hosting and serverless functions
- [Claude API](https://www.anthropic.com/api) (Anthropic) powering the Prioritization Assistant, called only from a Vercel serverless function — the frontend never holds or sends the API key directly

## Local development

```bash
npm install
cp .env.example .env    # paste your own Anthropic API key into .env
```

Plain `npm run dev` (Vite only) serves the frontend but not `/api` routes. To
run the frontend and the serverless functions together on one origin, use the
Vercel CLI instead:

```bash
npx vercel dev
```

`.env` is gitignored and never committed — get a key from
[console.anthropic.com](https://console.anthropic.com/).

## Deploying to Vercel

In the Vercel project's dashboard, under **Settings → Environment Variables**,
add `ANTHROPIC_API_KEY` for the Production (and Preview/Development, if
needed) environment. Vercel auto-detects the Vite framework and treats
`api/*.ts` files as serverless functions; `vercel.json` handles SPA routing so
client-side routes fall back to `index.html` while `/api/*` routes reach the
functions.

## About this project

Stackt was designed and built end-to-end using [Claude Code](https://claude.com/claude-code),
starting from a research-driven UX design process (Figma) through to a
production React app with an AI-powered feature backed by a real serverless
architecture.
