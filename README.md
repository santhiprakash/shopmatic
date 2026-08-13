# Shopmatic

Open-source storefronts for influencers and affiliate marketers.

Paste a product URL. Get a public page at **`/@your-name`**. Share it.

**Live:** [shopmatic.cc](https://shopmatic.cc) · **License:** MIT

The bar we are building to is **Shopify-simple**: sign up → name the store → add one product → copy a link.

## Quick start

```bash
git clone https://github.com/santhiprakash/shopmatic.git
cd shopmatic
npm install && npm run server:install
cp .env.example .env          # set DATABASE_URL and JWT_SECRET
npm run db:migrate
npm run dev:full              # app :8080  ·  API :3001
```

Full walkthrough: **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)**  
What is actually built: **[docs/PLATFORM_STATUS.md](docs/PLATFORM_STATUS.md)**  
All docs: **[docs/README.md](docs/README.md)**

## What you can do today

- Register, sign in, reset password, verify email
- Add products by hand or with AI Quick Add (needs an OpenAI key)
- Organize with categories and tags
- Customize theme (light / dark / colors)
- Attach Amazon / Flipkart / Myntra / Nykaa affiliate IDs
- Publish a storefront at `/@username`
- See basic click analytics

Payments, custom domains, and a guided first-run wizard are **not** ready. Do not advertise them yet.

## Stack

| Layer | Choice |
| --- | --- |
| App | React 18, TypeScript, Vite, Tailwind, shadcn/ui |
| API | Express + TypeScript (`server/`, port 3001) |
| Database | PostgreSQL (Neon in production) |
| Auth | Server-side JWT (`JWT_SECRET` — never `VITE_*`) |
| Mail | Emailit (optional in development) |
| AI | OpenAI, optional |

## Contributing

We want later contributors to land in under 30 minutes.

1. Read [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).
2. Read [CONTRIBUTING.md](CONTRIBUTING.md).
3. Pick a lane from [docs/PLATFORM_STATUS.md](docs/PLATFORM_STATUS.md) (wizard, empty states, demo seed, env hardening).
4. Open a focused PR. If you change signup, first product, or env vars, update GETTING_STARTED and PLATFORM_STATUS in the same PR.

## Support

- Site: [shopmatic.cc](https://shopmatic.cc)
- Issues: [github.com/santhiprakash/shopmatic/issues](https://github.com/santhiprakash/shopmatic/issues)
