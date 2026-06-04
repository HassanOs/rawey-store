# Rawey

Arabic-first minimalist e-commerce app for original perfume testers.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase Database + Storage image URLs
- Zustand cart persistence
- React Hook Form + Zod checkout validation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Run `supabase/schema.sql` in the Supabase SQL editor. This includes brand/product slugs, admin dashboard indexes, and analytics helpers.

4. Start development:

```bash
npm run dev
```

## Notes

- Admin login is `/admin`. Authenticated dashboard pages live under `/admin/overview`, `/admin/orders`, `/admin/products`, and `/admin/settings`.
- Admin auth uses `ADMIN_PASSWORD` plus a signed `ADMIN_SESSION_SECRET` cookie secret in production.
- Product images can be Supabase Storage public URLs or other allowed remote URLs configured in `next.config.ts`.
- Checkout is guest-only and stores orders in Supabase.

