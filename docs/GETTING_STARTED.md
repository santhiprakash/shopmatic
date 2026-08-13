# Getting started

**Goal:** from zero to a running Shopmatic in about 15 minutes, then one product on a public page.

## Try the hosted app

1. Open [https://shopmatic.cc](https://shopmatic.cc).
2. Use **Get started** / **Sign in** in the header (auth is a modal, not `/login`).
3. Or use **Demo login** if the landing page offers it (`loginDemo` in `AuthContext`).
4. Add a product (paste a URL if Quick Add is configured).
5. Open your public page at `https://shopmatic.cc/@your-username`.

You do **not** need an account to *view* someone else’s storefront.

## Run it locally

### What you need

- Node.js 18+
- npm
- A Postgres database (Neon is what production uses; local Postgres is fine)

OpenAI is **optional**. Without `VITE_OPENAI_API_KEY`, you can still add products by hand. Email (Emailit) is optional in development.

### 1. Clone

```bash
git clone https://github.com/santhiprakash/shopmatic.git
cd shopmatic
```

### 2. Install

```bash
npm install
npm run server:install
```

### 3. Environment

```bash
cp .env.example .env
```

Minimum for a local loop:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/shopmatic?sslmode=require
JWT_SECRET=use-openssl-rand-base64-32
FRONTEND_URL=http://localhost:8080
PORT=3001
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME=Shopmatic
```

Optional:

```env
VITE_OPENAI_API_KEY=sk-...          # AI Quick Add
EMAILIT_API_KEY=...                 # verification / reset emails
EMAILIT_FROM_EMAIL=notifications@shopmatic.cc
```

**Do not put `JWT_SECRET` in a `VITE_*` variable.** Anything prefixed `VITE_` is baked into the browser bundle.

See [neon-setup.md](./neon-setup.md) if you are using Neon.

### 4. Database

```bash
npm run db:migrate
# optional sample catalog
npm run db:seed
```

Seed uses `demo@shopmatic.cc` as the demo curator.

### 5. Start both sides

```bash
npm run dev:full
```

- App: http://localhost:8080
- API: http://localhost:3001

Or in two terminals: `npm run dev` and `npm run dev:server`.

### 6. First store (the Shopify-shaped path)

1. Register from the header.
2. Confirm email if mail is configured (`/verify-email`).
3. Open **Dashboard** → set username / profile (this is the public `/@username`).
4. **My products** → add one product (URL paste or manual).
5. Open `/@username` in a private window. That is the share link.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite app on 8080 |
| `npm run dev:server` | Express API on 3001 |
| `npm run dev:full` | Both |
| `npm run test:run` | Vitest once |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run db:seed` | Demo curator + products |

## If something fails

| Symptom | Check |
| --- | --- |
| API 500 on login | `DATABASE_URL` reachable; `npm run db:migrate` ran |
| CORS / blank API | `FRONTEND_URL` matches the Vite origin (`http://localhost:8080`) |
| Quick Add does nothing | `VITE_OPENAI_API_KEY` missing — use manual add |
| Merge-conflict markers in env | `.env.example` must not contain `<<<<<<<` — report it if you still see that |

Next: [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) for what is ready before we promote the product socially.
