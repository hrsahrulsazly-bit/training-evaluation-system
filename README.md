# Training Evaluation System

A Training Request → Approval → Rating → 3-Month Effectiveness Review system,
built with Next.js (App Router), Prisma, and Auth.js.

## How it works

1. **Staff submit a TRF** (`/trf`, public, no login) — sits as `PENDING` until
   their superior approves or rejects it. HR/Admin can also bulk-add
   already-approved trainings directly (`/admin/bulk-add`), skipping the TRF.
2. **Superior approves/rejects** (`/superior`, login required) — approval
   creates a `TrainingRecord`, the source of truth for everything after.
3. **Staff rate the training** via a unique link (`/rate/[token]`, public) —
   HR copies this link from the Admin dashboard's records table and shares it
   after the training ends.
4. **+90 days later**, a daily cron job (`/api/cron/reminders`) finds records
   where the superior hasn't rated effectiveness yet and emails them a login
   link. Superior rates via `/superior/rate/[id]`.
5. **HR exports** PDF (per record) or Excel (bulk, filterable) from
   `/admin/export` for audit.
6. **Staff self-service**: `/search` — search by name, see TRF status and
   this year's training records, no login needed.

## Local development

This runs against **Postgres on Neon** — the same database used in
production (connected via the Vercel Neon integration). Local dev and prod
share one database, so anything you create locally is real data.

```bash
npm install
npx prisma migrate dev   # applies schema to the Neon database in DATABASE_URL
npm run db:seed          # creates an admin + one sample superior account
npm run dev
```

Seeded logins (change these immediately in production):
- Admin: `admin@ghcl.local` / `ChangeMe123!`
- Superior: `ahmad.ridha@ghcl.local` / `ChangeMe123!`

### Importing your existing Google Sheet data

1. In the original Google Sheet: **File → Download → Comma Separated Values**,
   save as `legacy-export.csv` in the project root.
2. `npm run db:seed:legacy`

Every distinct HOD name in the sheet becomes a superior account with a
placeholder email (`name.slug@ghcl.local`) and a random temp password printed
to the console. **You must update each superior's real email + set a proper
password afterwards** via Admin → Urus Senarai, otherwise the 3-month
reminder emails have nowhere real to go.

## Environment variables

See `.env` for local defaults. For production (Vercel), set these in
**Project Settings → Environment Variables**:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres (pooled) connection string — auto-set by the Neon Vercel integration |
| `DATABASE_URL_UNPOOLED` | Postgres (direct) connection string, used for migrations — auto-set by the Neon Vercel integration |
| `AUTH_SECRET` | Random 32+ char secret — generate with `openssl rand -base64 32` |
| `GMAIL_USER` | `hr.sahrulsazly@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail **App Password** (Google Account → Security → App Passwords), not your normal password |
| `APP_BASE_URL` | Your production URL, e.g. `https://training-eval.vercel.app` |
| `CRON_SECRET` | Random secret — Vercel automatically sends it as `Authorization: Bearer <value>` when calling scheduled cron routes, once set as an env var |

`DATABASE_URL` and `DATABASE_URL_UNPOOLED` are already set in Vercel via the
Neon Storage integration. You still need to add `AUTH_SECRET`, `GMAIL_USER`,
`GMAIL_APP_PASSWORD`, `APP_BASE_URL`, and `CRON_SECRET` manually in
**Project Settings → Environment Variables** before your first deploy — the
daily 3-month-reminder cron (`vercel.json`) won't work without them.

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Prisma · Auth.js
(Credentials + JWT sessions) · Tailwind CSS · Nodemailer (Gmail SMTP) ·
`@react-pdf/renderer` · `exceljs`.
