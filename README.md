# LeetCode Question Randomizer

LeetCode Question Randomizer built with Next.js.

## Tech Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL via `pg`
- Motion, GSAP, and React Bits-inspired animation components

## Project Structure

- `src/app/api/`: database-backed API routes for questions and counter.
- `src/components/`: reusable UI pieces such as filters, slot card, footer, and animation components.
- `src/hooks/`: client state/data hooks for questions, filters, slot behavior, and theme.
- `src/lib/`: database pooling and shared question utilities.
- `src/types/`: shared TypeScript types.

## Environment

Use `.env` for the local development database:
`npm run dev` loads `.env` and connects to the local database.

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/lc_qn_randomizer_dev
DATABASE_POOL_MAX=5
SSL_MODE=disable
```

Use `.env.prod` when intentionally running the local app against production:
`npm run dev:prod` explicitly loads `.env.prod` and connects to production.

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_POOL_MAX=5
SSL_MODE=verify-full
```

Restart the development server when switching environments.
