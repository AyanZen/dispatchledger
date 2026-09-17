# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two admins who share the same work, with no division of duties between them — either one may add a franchise, record a dispatch, log a payment, or chase an overdue account on any given day. A second `staff` role exists in the system with read and record access but no franchise/employee/settings administration.

Confirmed usage: desktop or laptop at the office **and** phone on the go, in roughly equal measure. Neither is the secondary case; both must be excellent.

## Product Purpose

Dispatch Ledger tracks materials sent to franchises on credit and the money that comes back. It answers one question continuously: **who owes us what, and how late are they?**

The working loop is: a dispatch goes out and is recorded against a bill number; payments come in and are applied against that bill or against the account; the franchise's outstanding balance moves; when a bill passes its term it becomes overdue, and past the grace window it becomes critical. Success is that no overdue balance goes unnoticed and every rupee is traceable to a bill.

## Positioning

Generic accounting software records transactions; Dispatch Ledger is shaped around the credit relationship with a *franchise*, so the unit of attention is the franchise's standing rather than the ledger entry. Ageing (pending → overdue → critical) is derived automatically from each bill's own term days plus a grace window, and reminder emails fire off that same derivation, so chasing is a consequence of recording rather than a separate task.

## Operating Context

- Currency is **INR**; dates are handled as plain `YYYY-MM-DD` day strings in India time, not timestamps.
- Bill numbers follow a per-franchise sequence and may also be entered manually; uniqueness per franchise is enforced.
- Payments are made either against a specific bill or on-account against the franchise.
- Historical data predates the app: past deliveries and payments arrive as CSV/XLSX files and are imported with a validation preview.
- Overdue reminder emails are sent by a scheduled cron job, not by a user action.
- An activity log records who did what, so two admins working the same accounts can reconstruct events.

## Capabilities and Constraints

Screens: Login, Dashboard, Franchises list, Franchise detail (deliveries, payments, ledger, charts), Alerts, Activity Log, Employees, Settings, Profile.

Capabilities: franchise CRUD; deliveries/orders with bill number, amount, date, and term days; per-bill and on-account payments; derived ageing and outstanding balances; credit-limit and term/grace configuration; overdue and critical alerting; scheduled reminder emails; CSV/XLSX import of past records with row-level validation; activity log; employee accounts with admin/staff roles; CSV export of period reports.

Technical constraints (existing codebase, not up for redesign): Next.js App Router monolith, React client components, Prisma + PostgreSQL, JWT auth in `localStorage`, Tailwind v4 with shadcn/ui primitives, Recharts for charts, lucide-react for icons. A single bootstrap fetch hydrates the portal; route-level code splitting is deliberate and performance must not regress.

## Brand Commitments

- The name **Dispatch Ledger** is binding.
- Nothing else is. The previous gold-and-cream identity was explicitly released for replacement, as was the existing wording of labels.
- Binding visual reference: the user pinned a modern violet/lavender admin-dashboard reference image (`.impeccable/reference/dashboard-reference.png`) as the world this product should inhabit.

## Evidence on Hand

Real production data lives in the connected Postgres database — actual franchises, dispatches, payments, and activity. There are no marketing assets, no logo file, no testimonials, no pricing, and no public site. None of these may be fabricated; any screen that needs them is out of scope rather than invented.

## Product Principles

1. **The balance is the headline.** Every screen answers "what is owed" before it answers anything else.
2. **Ageing is derived, never typed.** Status comes from dates and terms; a human never sets it, so the interface must make the derivation legible.
3. **Two admins, one truth.** Anything one admin does must be visible and attributable to the other.
4. **Recording must be fast on a phone.** The capture paths — dispatch and payment — are used standing up, one-handed, away from a desk.
5. **Money is exact.** Amounts are shown in full INR, aligned and unabbreviated wherever a decision depends on them.

## Accessibility & Inclusion

No product-specific standard was established. Baseline applies: text contrast at WCAG AA, full keyboard operation, and visible focus, since the app is operated all day by its two primary users.
