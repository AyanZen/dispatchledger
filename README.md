# Dispatch Ledger

Franchise credit and dispatch management — **Next.js monolith** (App Router + API routes + Prisma).

## Stack

- **Next.js 15** (React 19, App Router)
- **Prisma 6** + PostgreSQL
- **Tailwind CSS v4** + shadcn/ui
- **Vercel** (app + hourly cron for email reminders)

## Local development

```bash
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET (min 32 chars)

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Default dev admin: `admin` / `admin123` (unless `SEED_ADMIN_PASSWORD` is set).

## Production (Vercel)

Set these environment variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (use pooled URL, e.g. Neon `?pgbouncer=true&connection_limit=1`) |
| `JWT_SECRET` | Min 32 characters |
| `JWT_EXPIRES_IN` | e.g. `24h` |
| `SEED_ADMIN_PASSWORD` | First admin password on deploy |
| `CRON_SECRET` | Protects `/api/cron/reminders` |
| `SMTP_*` | Optional email reminders |

Build command (default): `npm run build`  
Cron: configured in `vercel.json` (hourly email reminders).

## Routes

| Path | Description |
|------|-------------|
| `/dashboard` | Overview, chart, CSV export |
| `/franchises` | Franchise list |
| `/franchises/[id]` | Franchise detail |
| `/alerts` | Overdue / critical alerts |
| `/activity` | Audit log |
| `/users` | Employees (admin) |
| `/settings` | App settings (admin) |
| `/profile` | Password change |

## Importing past records

Admins can backfill history per franchise from **Franchise → Import past records** (CSV or `.xlsx`).

Import **deliveries first**, then payments, so payments can be matched to their bill numbers.

**Deliveries columns** — `Bill No`, `Date`, `Amount` required; `Materials`, `Term Days`, `Notes` optional.

**Payments columns** — `Date`, `Amount`, `Method` required; `Reference`, `Bill No` optional.

- `Method` must be Cash, Cheque, or Online (`UPI`, `NEFT`, `Cheque no.` variants are recognised).
- `Reference` is required for Cheque and Online payments.
- Leave `Bill No` blank to record a general account payment.
- Dates accept `YYYY-MM-DD`, `DD/MM/YYYY`, and Excel date cells.

Every file is validated before anything is saved: duplicate bill numbers, unknown bills, bad dates, and
payments exceeding a bill's balance are reported per row, and you can skip bad rows and import the rest.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (includes Prisma generate + migrate deploy)
- `npm run db:migrate` — create/apply migrations locally
- `npm run db:studio` — Prisma Studio
