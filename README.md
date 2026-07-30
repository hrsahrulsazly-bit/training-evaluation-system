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

This runs against **SQLite** locally (zero external dependencies) — see
"Before deploying to Vercel" below for switching to Postgres.

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
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
| `DATABASE_URL` | Postgres connection string (see below) |
| `AUTH_SECRET` | Random 32+ char secret — generate with `openssl rand -base64 32` |
| `GMAIL_USER` | `hr.sahrulsazly@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail **App Password** (Google Account → Security → App Passwords), not your normal password |
| `APP_BASE_URL` | Your production URL, e.g. `https://training-eval.vercel.app` |
| `CRON_SECRET` | Random secret — Vercel automatically sends it as `Authorization: Bearer <value>` when calling scheduled cron routes, once set as an env var |

## Before deploying to Vercel

The schema currently targets SQLite for zero-friction local dev. Switch to
Postgres before your first production deploy:

1. Create a Postgres database (Vercel Postgres, or Neon/Supabase) and grab
   its connection string.
2. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Set `DATABASE_URL` in Vercel to the Postgres connection string.
4. Run `npx prisma migrate deploy` (locally, pointed at the prod
   `DATABASE_URL`, or as a Vercel deploy step) to create the tables.
5. Run `npm run db:seed` once (with `SEED_ADMIN_PASSWORD` set to something
   real) to create your first admin account — or `npm run db:seed:legacy` to
   import your existing sheet data.

The daily 3-month-reminder cron is already configured in `vercel.json` and
will start firing automatically once deployed (requires `CRON_SECRET`,
`GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `APP_BASE_URL` to be set).

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Prisma · Auth.js
(Credentials + JWT sessions) · Tailwind CSS · Nodemailer (Gmail SMTP) ·
`@react-pdf/renderer` · `exceljs`.
