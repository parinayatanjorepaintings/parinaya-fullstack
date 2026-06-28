# Sri Sri Parinaya — Full Stack Project

This folder contains **both** the frontend (Vite + React) and the backend (Node/Express + PostgreSQL).

```
parinaya-tanjore/          ← this folder
├── src/                   ← React frontend source
│   ├── services/api.js    ← All API calls (NO static data files)
│   ├── hooks/useConfig.js ← Site config React hook
│   ├── components/        ← All UI components (wired to API)
│   └── pages/             ← All pages (wired to API)
├── admin/                 ← Admin panel HTML (served by backend)
├── backend-src/           ← Node/Express backend source
│   ├── index.js           ← Express entry point
│   ├── db/
│   │   ├── init.js        ← Create DB tables
│   │   ├── seed.js        ← Seed categories, products, config
│   │   └── pool.js        ← PostgreSQL pool
│   ├── middleware/
│   │   ├── auth.js        ← JWT + session guards
│   │   └── upload.js      ← Multer image upload
│   └── routes/
│       ├── auth.js        ← Login / logout / password
│       ├── categories.js  ← Category CRUD
│       ├── products.js    ← Product CRUD + image upload
│       └── config.js      ← Site settings key-value store
├── backend-package.json   ← Backend npm dependencies
├── backend.env.example    ← Backend env template → copy to .env
├── .env.local             ← Frontend env (VITE_API_URL=http://localhost:4000)
├── package.json           ← Frontend (Vite) dependencies
├── vite.config.js         ← Vite config
└── tailwind.config.js     ← Tailwind config
```

---

## Development Setup

### Step 1 — Backend

```bash
# Install backend dependencies
npm install --prefix . --package-lock-only  # or just:
cd parinaya-tanjore   # (this folder)
npm install -f --package-json backend-package.json
# Easier: just run  →
npx npm install --prefix backend-deps -f   
```

> **Simplest approach:** create a separate backend folder:
> ```bash
> cp -r backend-src/ ../parinaya-backend/src
> cp backend-package.json ../parinaya-backend/package.json
> cp backend.env.example ../parinaya-backend/.env
> cp -r admin/ ../parinaya-backend/admin
> cd ../parinaya-backend
> npm install
> ```
> Then follow the backend steps below.

### Step 2 — Configure Backend

```bash
# In your backend folder:
cp backend.env.example .env
# Edit .env — paste your Neon DATABASE_URL, set JWT_SECRET etc.

# Create tables and seed data:
npm run db:init
npm run db:seed
# Start backend:
npm run backend:dev     # with nodemon
# or
node backend-src/index.js
```

Backend starts at **http://localhost:4000**  
Admin panel: **http://localhost:4000/admin/login**  
Default login: `admin@srisriparinaya.com` / `Admin@1234`

### Step 3 — Frontend

```bash
# In this folder (parinaya-tanjore):
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

The frontend reads `VITE_API_URL` from `.env.local` — already set to `http://localhost:4000`.

---

## Production Deployment

### Backend → VPS

1. Copy `backend-src/`, `admin/`, `backend-package.json` (rename to `package.json`) to your VPS.
2. Set `.env` with `NODE_ENV=production`, your real `DATABASE_URL`, strong `JWT_SECRET`.
3. Run `npm run db:init && npm run db:seed` once.
4. Use PM2: `pm2 start backend-src/index.js --name parinaya-api`
5. Nginx reverse proxy → port 4000, with SSL via Certbot.

### Frontend → Vercel

In Vercel project settings → **Environment Variables**:
```
VITE_API_URL = https://api.srisriparinaya.com
```
Redeploy. Done.

---

## What Changed vs the Original Frontend

All `src/data/` files (`products.js`, `categories.js`, `siteConfig.js`) are **deleted**.

Every component now fetches from the API:

| Component / Page | Was | Now |
|---|---|---|
| `Header` | `import { categories } from data/categories` | `getCategories()` via API |
| `Footer` | `import { siteConfig, categories }` | `useConfig()` + `getCategories()` |
| `AnnouncementBar` | `siteConfig.announcement` | `config.announcement` from API |
| `FloatingWhatsApp` | `buildWhatsAppLink()` from siteConfig | async `buildWhatsAppLink()` from API |
| `WhatsAppButton` | sync siteConfig | async, fetches WA number from API |
| `ProductCard` | static `buildWhatsAppLink` | async API call; handles `img.url` objects |
| `FeaturedProducts` | `getFeaturedProducts()` from static data | `getFeaturedProducts()` API, with skeleton loading |
| `CategoryGrid` | static categories array | `getCategories()` API, with skeleton loading |
| `AboutStrip` | hardcoded text + siteConfig | `useConfig()` — editable from admin |
| `Collection.jsx` | sync static data | async API with loading state |
| `ProductDetail.jsx` | sync static data | async API; per-product accordion text with config fallbacks |
| `Contact.jsx` | siteConfig | `useConfig()` — editable from admin |
