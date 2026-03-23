# MahFrend

Minimalist lending management app for friends and family. Track loans, payments, and borrowers with a clean, editorial UI.

## Tech Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Auth:** Google OAuth + Email/Password via Supabase Auth

## Getting Started

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql` to create all tables and policies
3. Go to **Authentication > Providers** and enable:
   - **Email** (enabled by default)
   - **Google** — add your Google OAuth Client ID and Secret ([guide](https://supabase.com/docs/guides/auth/social-login/auth-google))

4. Go to **Authentication > URL Configuration** and add:
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-domain.com/auth/callback`

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (found in **Settings > API**):

```sh
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set the root directory to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Deploy

### Frontend → Other Platforms

Works on any platform that supports Next.js:

- **Netlify:** `npm run build` → deploy `.next` output
- **Railway:** Connect GitHub repo, set build command to `npm run build`
- **Docker:** Use the official Next.js Dockerfile

### Backend → Supabase (Free Tier)

Supabase handles everything — database, auth, and API. The free tier includes:

- 500 MB database
- 50,000 monthly active users
- 5 GB bandwidth
- 1 GB file storage

No separate backend deployment needed.

## Project Structure

```ini
src/
├── app/
│   ├── (auth)/           # Login, Signup, Onboarding
│   ├── (dashboard)/      # Dashboard, Calendar, Users, Loans, Payments, Configuration
│   ├── auth/callback/    # OAuth callback handler
│   └── layout.tsx        # Root layout
├── components/
│   ├── layout/           # Header, Sidebar, BottomNav
│   └── ui/               # shadcn/ui components
├── lib/
│   └── supabase/         # Supabase client (browser, server, middleware)
├── types/
│   └── database.ts       # TypeScript types
└── middleware.ts          # Auth middleware
```

## Features

- Google OAuth & email authentication
- Onboarding flow for new users
- Dashboard with lending statistics
- Calendar view with overdue/approaching/on-time indicators
- Borrower management (CRUD)
- Loan entry creation with interest calculation
- Payment recording with balance tracking
- Lending configuration (capital limits)
- Mobile-first responsive design
- Editorial "Functional Brutalism" design system
