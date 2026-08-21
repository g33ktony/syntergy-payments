# Syntergy Payments

Personal ledger for money people owe you. Dashboard, installment tracking (`3/7`), and per-person history.

Production: [payments.syntergy.app](https://payments.syntergy.app)

## Stack

Next.js App Router, Prisma, Neon Postgres, Vercel, password gate.

## Local setup

```bash
cp .env.example .env.local
# set DATABASE_URL, AUTH_SECRET, APP_PASSWORD, DEFAULT_CURRENCY
npm install
npx prisma migrate deploy
npm run dev
```

Do not commit `.env.local`.
