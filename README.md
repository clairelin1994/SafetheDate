# 🌸 Safe the Date!

**A personal safety check-in tool designed for women.**

Before a potentially risky activity (a date, night run, rideshare, meeting a stranger), create a safety check-in. If you confirm you returned safely before the deadline — the record is deleted silently. If the deadline passes without confirmation, your emergency contacts are automatically notified by email.

> ⚠️ **This is NOT an emergency service.** Safe the Date! is a reminder and notification tool only. In case of immediate danger, call 911 or your local emergency number.

---

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend  | Next.js API Routes            |
| Database | PostgreSQL                    |
| Email    | Resend API                    |
| Hosting  | Vercel                        |

---

## Features

- **No password required** — sign in with just your email address
- **Create a check-in** — set location, companion, activity, and return deadline
- **Live countdown timer** on the dashboard
- **One-tap safe confirmation** — marks session complete, no emails sent
- **Automatic overdue alerts** — cron job runs every minute, sends email to all contacts if deadline passes
- **Mobile-first, calm UI** — soft pink design built for quick use under pressure

---

## Project Structure

```
safe-of-the-date/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home / landing page
│   ├── login/page.tsx          # Email login (find-or-create)
│   ├── signup/page.tsx         # Redirects to /login
│   ├── new-checkin/page.tsx    # Check-in creation form
│   ├── dashboard/
│   │   ├── page.tsx            # Active session + countdown
│   │   └── SafeButton.tsx      # Client "I'm safe" button
│   ├── safe-confirmation/page.tsx
│   └── api/
│       ├── auth/login/         # POST — find or create user, set JWT cookie
│       ├── auth/logout/        # POST — clear cookie
│       ├── checkins/           # POST — create check-in
│       ├── checkins/[id]/safe/ # PATCH — mark session completed
│       └── cron/check-overdue/ # GET  — send overdue alerts (cron)
├── components/
│   ├── Header.tsx
│   ├── CountdownTimer.tsx      # Client countdown
│   └── DisclaimerBanner.tsx
├── lib/
│   ├── db.ts                   # pg Pool singleton
│   ├── auth.ts                 # JWT sign / verify / cookie helpers
│   └── email.ts                # Resend email utility
├── db/
│   └── schema.sql              # PostgreSQL schema
├── utils/
│   └── validation.ts           # Zod schemas
├── middleware.ts               # Protects /new-checkin, /dashboard, /safe-confirmation
├── vercel.json                 # Cron job config (every minute)
└── .env.local.example
```

---

## 1. Install Dependencies

```bash
cd safe-of-the-date
npm install
```

---

## 2. Set Up Environment Variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Then fill in the values:

```env
# PostgreSQL — get a free DB at https://neon.tech or https://supabase.com
DATABASE_URL=postgres://user:password@host/dbname?sslmode=require

# Resend — get a free API key at https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# JWT secret — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-long-random-secret

# Cron secret — any random string; Vercel uses this to authenticate cron calls
CRON_SECRET=your-cron-secret

# App URL (used for links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Set Up the Database

Run the schema against your PostgreSQL database:

**Option A — psql CLI:**
```bash
psql $DATABASE_URL -f db/schema.sql
```

**Option B — Neon / Supabase SQL Editor:**
Copy and paste the contents of `db/schema.sql` into the SQL editor and run it.

---

## 4. Configure Resend Sending Domain

1. Create a free account at [resend.com](https://resend.com)
2. Add and verify your sending domain (or use the sandbox `onboarding@resend.dev` for testing)
3. Update the `FROM_ADDRESS` constant in `lib/email.ts` to match your verified domain

---

## 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

To test the cron endpoint locally:
```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/check-overdue
```

---

## 6. Deploy to Vercel

### One-click deploy

```bash
npm install -g vercel
vercel
```

### Set environment variables on Vercel

In the Vercel dashboard → Project → Settings → Environment Variables, add:

| Variable           | Value                          |
|--------------------|--------------------------------|
| `DATABASE_URL`     | Your production Postgres URL   |
| `RESEND_API_KEY`   | Your Resend key                |
| `JWT_SECRET`       | A long random secret           |
| `CRON_SECRET`      | A random string                |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL  |

### Cron job

The `vercel.json` file configures the cron job to run every minute:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-overdue",
      "schedule": "* * * * *"
    }
  ]
}
```

> **Note:** Cron jobs running every minute require Vercel's **Pro** plan.
> On the free (Hobby) plan the minimum interval is **once per day** (`0 0 * * *`).
> For testing on Hobby, change the schedule or trigger the endpoint manually.

Vercel automatically passes `CRON_SECRET` as a Bearer token in the `Authorization` header, so the endpoint is protected without any extra configuration.

---

## Security Notes

- Emails are validated with Zod before hitting the database
- All database queries use parameterized statements (no SQL injection)
- JWT tokens are stored in `httpOnly`, `sameSite=lax` cookies (no XSS access)
- The cron endpoint is protected by `CRON_SECRET`
- Session ownership is verified on every mutation (user can only close their own session)

---

## Roadmap (Post-MVP)

- [ ] Magic-link email login for stronger identity verification
- [ ] SMS alerts via Twilio
- [ ] Session history / archive view
- [ ] Ability to extend deadline from dashboard
- [ ] Web push notifications
- [ ] PWA support for mobile home screen install
