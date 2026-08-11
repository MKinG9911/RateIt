# RateIt — Community-Driven Rating & Review Platform

RateIt is a full-stack platform where users create listings for movies, hotels, restaurants, shops, and technology products, and other users rate and review them using category-specific criteria.

---

## 🌟 Features

- **Supabase Authentication**: Email/password registration, login, logout, password recovery, session refresh via cookie-based SSR.
- **Role-Based Access Control**: `USER` and `ADMIN` roles enforced in application database.
- **User Status Enforcement**: `ACTIVE` and `SUSPENDED` user states (suspended users can view public content but cannot perform write operations).
- **User-Submitted Listings**: Authenticated users submit listings with real-time duplicate detection across 9 flat categories.
- **Listing Identity Locking**: Once a listing receives its first review, name, category, and brand are locked to prevent tampering.
- **Category-Specific Criteria & Dynamic Ratings**: Category-specific rating criteria scored 1–5. Overall ratings calculated strictly server-side using transactions.
- **Admin Moderation & Analytics**: Admin dashboard for listing/review moderation (with reason logging), user status management, category criteria management, and aggregated platform analytics.

---

## 🏗 Architecture

```text
Browser (Next.js 15 App Router)
   ↓
Supabase Auth (Cookies / PKCE / SSR)
   ↓ Bearer access token
NestJS 11 REST API (/api/v1)
   ↓ jose + JWKS Token Verification
Prisma 6 ORM
   ↓
Supabase PostgreSQL
```

### Security Architecture Rules Enforced

1. Supabase Auth owns user credentials; NestJS never stores passwords or tokens in Prisma.
2. NestJS verifies Supabase JWT access tokens asynchronously using asymmetric public key sets (`jose` + JWKS endpoint).
3. Database application tables are kept private; the browser never makes direct Supabase Data API calls (`supabase.from()`).
4. Roles (`USER` / `ADMIN`) and statuses (`ACTIVE` / `SUSPENDED`) are managed strictly inside the application database. Editable Supabase `user_metadata` is never trusted for authorization.
5. All write endpoints enforce `ActiveUserGuard`.

---

## 📁 Repository Structure

```text
rateit/
├── apps/
│   ├── api/                 # NestJS 11 REST API
│   │   ├── src/
│   │   │   ├── admin/       # Moderation & analytics endpoints
│   │   │   ├── auth/        # JWKS guard, roles guard, active user guard
│   │   │   ├── categories/  # Category & criteria endpoints
│   │   │   ├── common/      # Exception filter & Zod pipe
│   │   │   ├── listings/    # Listing CRUD, duplicate check, lock rules
│   │   │   ├── reviews/     # Review CRUD, overall rating calc, transactions
│   │   │   └── users/       # User profile & management
│   │   └── test/            # Vitest unit & integration tests
│   └── web/                 # Next.js 15 App Router web application
│       ├── src/
│       │   ├── app/         # App router pages (public, auth, user, admin)
│       │   ├── components/  # Dark-themed UI components (star rating, cards, etc.)
│       │   └── lib/         # API client & Supabase SSR helpers
├── packages/
│   ├── database/            # Prisma schema, client, & seed script
│   └── shared/              # Shared Zod schemas, constants, & utils
├── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

---

## 📋 Prerequisites

- **Node.js**: `v22.0.0` or newer
- **pnpm**: `v10.0.0` or newer
- **Supabase Account**: A free Supabase project (PostgreSQL + Auth)

---

## 🚀 Environment Setup & Supabase Configuration

### 1. Create a Supabase Project

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Go to **Project Settings → Database** and copy the URI connection strings:
   - **Transaction Pooler (Port 6543)** for `DATABASE_URL`
   - **Session / Direct (Port 5432)** for `DIRECT_URL`
3. Go to **Project Settings → API** and copy:
   - Project URL (`https://<project-ref>.supabase.co`)
   - `anon` `public` key
4. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Add **Redirect URL**: `http://localhost:3000/auth/callback` and `http://localhost:3000/auth/reset-password`

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Fill in your project values in `.env`:

```env
# ⚠️ CRITICAL: Ensure DATABASE_URL points to your Supabase PostgreSQL instance!
DATABASE_URL="postgresql://postgres.[YOUR_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[YOUR_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth Public Credentials
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Supabase Auth Server Credentials (for NestJS JWT verification)
SUPABASE_URL="https://[YOUR_REF].supabase.co"
SUPABASE_JWT_ISSUER="https://[YOUR_REF].supabase.co/auth/v1"

# Application Ports
API_PORT=4000
API_CORS_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

---

## 🛠 Installation & Migration Commands

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Apply database migrations to Supabase PostgreSQL
# ⚠️ Make sure DATABASE_URL points to your Supabase DB before running!
pnpm db:migrate:dev

# 4. Seed initial 9 categories and rating criteria
pnpm db:seed
```

---

## 👑 How to Create the First Admin User

1. Start the application (`pnpm dev`) and register a new user at `http://localhost:3000/auth/register`.
2. Find the newly created User UUID in Supabase Auth dashboard or SQL Editor.
3. Execute the following SQL statement in the **Supabase SQL Editor**:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
   ```
4. Log out and log back in. The user now has full access to `/admin` routes.

---

## 💻 Development & Production Commands

```bash
# Start NestJS API (port 4000) and Next.js Web (port 3000) concurrently in dev mode
pnpm dev

# Start API only
pnpm dev:api

# Start Web only
pnpm dev:web

# Run unit & integration test suite (Vitest)
pnpm test

# Run TypeScript type check across monorepo
pnpm typecheck

# Format codebase with Prettier
pnpm format

# Production Build
pnpm build
```

---

## 🔒 Supabase RLS & Data API Security Explanation

- **Data API Isolation**: Application tables (`users`, `categories`, `listings`, `rating_criteria`, `reviews`, `review_ratings`) are accessed exclusively via NestJS and Prisma backend using standard database connections.
- **Row Level Security (RLS)**: If RLS is enabled on Supabase, default policies deny browser client access, ensuring all client requests are routed through NestJS validation pipes, guards, and business logic.

---

## ❓ Troubleshooting

- **401 Unauthorized in NestJS**: Ensure `SUPABASE_URL` matches your project reference and `SUPABASE_JWT_ISSUER` equals `https://<project-ref>.supabase.co/auth/v1`.
- **Database Migrations on Wrong DB**: Double check `.env` `DATABASE_URL` string before running `pnpm db:migrate:dev`.
