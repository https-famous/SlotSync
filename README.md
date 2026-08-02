# SlotSync

Multi-tenant appointment booking platform. Service businesses (barbers, consultants, coaches)
list services, manage availability, and get paid deposits via Stripe. Clients browse a
marketplace homepage, search by category, and book slots.

## Structure

```
slotsync/
├── server/     → Express API + PostgreSQL + Prisma
└── client/     → React + Vite frontend
```

## Getting started

### 1. Database
Create a local Postgres database (or use Neon/Railway) and copy the connection string.

### 2. Backend
```bash
cd server
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, STRIPE keys, RESEND_API_KEY
npm install
npx prisma migrate dev --name init
npm run dev                # runs on http://localhost:4000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev                # runs on http://localhost:5173
```

See `slotsync-project-plan.md` (in your project notes) for the full feature checklist,
schema reasoning, and build order — this scaffold mirrors that plan directly.
