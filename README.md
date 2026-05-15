# Baseline

A personal life tracking app — workouts, diet, finances, work sessions, habits, and todos in one place.

**Live:** [baseline-app-dusky.vercel.app](https://baseline-app-dusky.vercel.app)

## Features

- **Workout tracker** — log sessions, track streaks and personal records
- **Diet tracker** — calorie and macro logging with daily goals
- **Finance tracker** — income/expense transactions, weekly balance
- **Work tracker** — multi-timer (stopwatch + countdown), session todos, reminders
- **Habits** — daily habit tracking with 30-day history grid
- **Todos** — task management with priorities
- **Goals** — set weekly/daily targets per category with progress bars
- **Streaks** — consecutive day streaks for workout, diet, and work
- **AI Insights** — weekly analysis powered by Gemini
- **Weekly report** — email summary via Resend

## Stack

- [Next.js 16](https://nextjs.org) — App Router
- [Supabase](https://supabase.com) — database + auth
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Vercel](https://vercel.com) — deployment

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
RESEND_API_KEY=...
```
